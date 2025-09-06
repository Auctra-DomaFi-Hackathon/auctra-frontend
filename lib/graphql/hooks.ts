'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { graphqlService, type EnhancedDomainItem } from './services';
import { GET_ACTIVE_LISTINGS_QUERY, GET_NAME_FROM_TOKEN_QUERY, GET_NAME_EXPIRY_QUERY, GET_TOKEN_NAME_AND_EXPIRY, GET_ALL_ACTIVE_RENTAL_LISTINGS_QUERY, GET_RENTAL_LISTINGS_BY_OWNER_QUERY, GET_USER_RENTAL_HISTORY_QUERY } from './queries';
import { toUnixSeconds, toUnixSecondsFromISO } from '@/lib/utils/expiry';
import { listingsApolloClient, apolloClient } from './client';
import type { GetActiveListingsResponse, GetActiveListingsVariables, Listing, NFTMetadata, NameFromTokenResponse, NameFromTokenVariables, NameExpiryResponse, NameExpiryVariables, TokenNameAndExpiryResponse, TokenNameAndExpiryVariables, GetAllActiveRentalListingsResponse, GetAllActiveRentalListingsVariables, GetRentalListingsByOwnerResponse, GetRentalListingsByOwnerVariables, GetUserRentalHistoryResponse, GetUserRentalHistoryVariables, RentalListingWithMetadata, RentalHistory } from './types';

export function useMyDomains(walletAddress?: string) {
  const [domains, setDomains] = useState<EnhancedDomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Hindari race-condition ketika walletAddress berubah cepat
  const reqIdRef = useRef(0);

  const load = useCallback(async (addr: string) => {
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const items = await graphqlService.getMyDomains(addr);
      // Abaikan respons lama jika sudah ada request baru
      if (myReq !== reqIdRef.current) return;
      setDomains(items ?? []);
    } catch (e: any) {
      if (myReq !== reqIdRef.current) return;
      setDomains([]);
      setError(e?.message ?? 'Failed to fetch domains');
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset ketika tidak ada wallet
    if (!walletAddress) {
      reqIdRef.current++;
      setDomains([]);
      setError(null);
      setLoading(false);
      return;
    }
    load(walletAddress);
  }, [walletAddress, load]);

  // Refetch yang juga mengupdate state (bukan cuma mengembalikan promise)
  const refetch = useCallback(async () => {
    if (!walletAddress) return [];
    await load(walletAddress);
    return domains; // nilai setelah refetch akan tersedia lewat state
  }, [walletAddress, load, domains]);

  return { domains, loading, error, refetch };
}

export function useActiveListings(limit: number = 6) {
  const [listingsWithMetadata, setListingsWithMetadata] = useState<(Listing & { metadata?: NFTMetadata })[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Calculate offset based on current page (for future use if needed)
  // const offset = (currentPage - 1) * limit;
  
  const { data, loading, error, refetch } = useQuery<GetActiveListingsResponse, GetActiveListingsVariables>(
    GET_ACTIVE_LISTINGS_QUERY,
    {
      client: listingsApolloClient,
      variables: { limit: 100 }, // Fetch all listings initially
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        console.log('🔍 Active listings query completed:', {
          itemsCount: data?.listings?.items?.length,
          totalCount: data?.listings?.items?.length
        });
        setTotalCount(data?.listings?.items?.length || 0);
      }
    }
  );

  // Function to fetch domain metadata with ISO DateTime parsing (single query approach)
  const fetchNFTMetadata = useCallback(async (tokenId: string): Promise<NFTMetadata> => {
    try {
      console.log('🔍 Fetching domain data for tokenId:', tokenId);
      
      // Single query for both name and expiry (ISO DateTime)
      const { data } = await apolloClient.query<TokenNameAndExpiryResponse, TokenNameAndExpiryVariables>({
        query: GET_TOKEN_NAME_AND_EXPIRY,
        variables: { tokenId },                // tokenId harus STRING (angka sangat besar)
        fetchPolicy: "network-only",
        errorPolicy: "all",
      });

      console.log("Token Name & Expiry Query:", JSON.stringify(data, null, 2));

      const fullName = data?.nameStatistics?.name ?? null;
      const expiresAtUnix = toUnixSecondsFromISO(data?.token?.expiresAt); // ✔️ aman, bukan NaN
      const expirationISO = data?.token?.expiresAt ?? null;
      const isExpired = expiresAtUnix != null
        ? expiresAtUnix <= Math.floor(Date.now() / 1000)
        : null;

      // pecah SLD/TLD jika ada nama
      const [sld, tld] = fullName ? fullName.split(".") : [undefined, undefined];

      console.log('✅ Final domain metadata:', {
        tokenId,
        fullName,
        sld,
        tld,
        expiresAtUnix,
        expirationISO,
        isExpired,
        date: expiresAtUnix ? new Date(expiresAtUnix * 1000).toLocaleString() : 'No expiry data'
      });

      return {
        name: sld ?? (fullName ?? `Domain-${tokenId.slice(-8)}`),
        tld: tld ? `.${tld}` : ".eth",
        description: fullName ? `Domain: ${fullName}` : `NFT Domain with token ID: ${tokenId}`,
        expiresAt: expiresAtUnix,
        expirationISO,
        isExpired,
      };
    } catch (error) {
      console.error("❌ Failed to fetch domain expiry:", error);
      return {
        name: `Unknown-${tokenId.slice(-8)}`,
        tld: ".eth",
        description: "Failed to fetch domain info",
        expiresAt: null,
        expirationISO: null,
        isExpired: null,
      };
    }
  }, []);

  // Function to change page
  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Fetch metadata for all listings and paginate
  useEffect(() => {
    if (!data?.listings?.items?.length) {
      setListingsWithMetadata([]);
      return;
    }

    const fetchAllMetadata = async () => {
      setMetadataLoading(true);
      try {
        console.log('🔄 Fetching metadata for all listings:', data.listings.items.length);
        
        // Fetch metadata for ALL listings (not paginated)
        const allListingsWithMeta = await Promise.allSettled(
          data.listings.items.map(async (listing) => {
            try {
              const metadata = await fetchNFTMetadata(listing.tokenId);
              return { ...listing, metadata };
            } catch (error) {
              console.warn(`Failed to fetch metadata for token ${listing.tokenId}:`, error);
              return { ...listing, metadata: null };
            }
          })
        );
        
        // Extract successful results
        const successfulResults = allListingsWithMeta
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value);
        
        console.log('✅ Successfully processed all listings:', successfulResults.length);
        // Return ALL listings with metadata, no pagination here
        setListingsWithMetadata(successfulResults);
      } catch (error) {
        console.error('Failed to fetch metadata for listings:', error);
        // Fallback: return all listings without metadata
        setListingsWithMetadata(data.listings.items.map(listing => ({ ...listing })));
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchAllMetadata();
  }, [data, fetchNFTMetadata]); // Removed currentPage and limit dependencies

  const totalPages = Math.ceil(totalCount / limit);

  return {
    listings: listingsWithMetadata,
    loading: loading || metadataLoading,
    error,
    refetch,
    currentPage,
    totalPages,
    totalCount,
    onPageChange
  };
}

// RENTAL HOOKS - From CLAUDE.md requirements

// 1. Hook for Active Domain Rentals (for /app/rent page) with pagination
export function useActiveRentalListings(limit: number = 6) {
  const [rentalListingsWithMetadata, setRentalListingsWithMetadata] = useState<RentalListingWithMetadata[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { data, loading, error, refetch } = useQuery<GetAllActiveRentalListingsResponse, GetAllActiveRentalListingsVariables>(
    GET_ALL_ACTIVE_RENTAL_LISTINGS_QUERY,
    {
      client: listingsApolloClient,
      variables: { limit: 100 }, // Fetch all rental listings initially
      errorPolicy: 'all',
      onCompleted: (data) => {
        console.log('🔍 Rental listings query completed:', data);
        setTotalCount(data?.rentalListings?.items?.length || 0);
      },
      onError: (error) => {
        console.error('❌ Rental listings query error:', error);
      }
    }
  );

  // Function to fetch domain metadata with ISO DateTime parsing (single query approach)
  const fetchDomainWithExpires = async (tokenId: string): Promise<NFTMetadata> => {
    try {
      console.log('🔍 Fetching domain data for tokenId:', tokenId);
      
      // Single query for both name and expiry (ISO DateTime)
      const { data } = await apolloClient.query<TokenNameAndExpiryResponse, TokenNameAndExpiryVariables>({
        query: GET_TOKEN_NAME_AND_EXPIRY,
        variables: { tokenId },                // tokenId harus STRING (angka sangat besar)
        fetchPolicy: "network-only",
        errorPolicy: "all",
      });

      console.log("Token Name & Expiry Query:", JSON.stringify(data, null, 2));

      const fullName = data?.nameStatistics?.name ?? null;
      const expiresAtUnix = toUnixSecondsFromISO(data?.token?.expiresAt); // ✔️ aman, bukan NaN
      const expirationISO = data?.token?.expiresAt ?? null;
      const isExpired = expiresAtUnix != null
        ? expiresAtUnix <= Math.floor(Date.now() / 1000)
        : null;

      // pecah SLD/TLD jika ada nama
      const [sld, tld] = fullName ? fullName.split(".") : [undefined, undefined];

      console.log('✅ Final domain metadata:', {
        tokenId,
        fullName,
        sld,
        tld,
        expiresAtUnix,
        expirationISO,
        isExpired,
        date: expiresAtUnix ? new Date(expiresAtUnix * 1000).toLocaleString() : 'No expiry data'
      });

      return {
        name: sld ?? (fullName ?? `Domain-${tokenId.slice(-8)}`),
        tld: tld ? `.${tld}` : ".eth",
        description: fullName ? `Domain: ${fullName}` : `NFT Domain with token ID: ${tokenId}`,
        expiresAt: expiresAtUnix,
        expirationISO,
        isExpired,
      };
    } catch (error) {
      console.error("❌ Failed to fetch domain expiry:", error);
      return {
        name: `Unknown-${tokenId.slice(-8)}`,
        tld: ".eth",
        description: "Failed to fetch domain info",
        expiresAt: null,
        expirationISO: null,
        isExpired: null,
      };
    }
  };

  // Renamed function for clarity (wrap with useCallback to fix dependency warning)
  const fetchNFTMetadata = useCallback(fetchDomainWithExpires, []);

  // Function to change page
  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Fetch metadata for all listings and paginate
  useEffect(() => {
    if (!data?.rentalListings?.items?.length) {
      setRentalListingsWithMetadata([]);
      return;
    }

    const fetchAllMetadata = async () => {
      setMetadataLoading(true);
      try {
        const listingsWithMeta = await Promise.all(
          data.rentalListings.items.map(async (listing) => {
            const metadata = await fetchNFTMetadata(listing.tokenId);
            return { ...listing, metadata };
          })
        );
        // Filter for active, non-paused listings
        const activeListings = listingsWithMeta.filter(listing => listing.active && !listing.paused);
        
        // Paginate the results
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedListings = activeListings.slice(startIndex, endIndex);
        
        setRentalListingsWithMetadata(paginatedListings);
        setTotalCount(activeListings.length);
        console.log(`✅ Fetched ${listingsWithMeta.length} total listings, ${activeListings.length} active, showing page ${currentPage}`);
      } catch (error) {
        console.error('Failed to fetch metadata for rental listings:', error);
        const fallbackListings = data.rentalListings.items.slice((currentPage - 1) * limit, currentPage * limit);
        setRentalListingsWithMetadata(fallbackListings);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchAllMetadata();
  }, [data, fetchNFTMetadata, currentPage, limit]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    rentalListings: rentalListingsWithMetadata,
    allListings: rentalListingsWithMetadata,
    loading: loading || metadataLoading,
    error,
    refetch,
    currentPage,
    totalPages,
    totalCount,
    onPageChange
  };
}

// 2. Hook for Domain Rental Listings by Owner (for My Listings in Manage Rentals)
export function useRentalListingsByOwner(owner?: string, limit: number = 50) {
  const [listingsWithMetadata, setListingsWithMetadata] = useState<RentalListingWithMetadata[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const { data, loading, error, refetch } = useQuery<GetRentalListingsByOwnerResponse, GetRentalListingsByOwnerVariables>(
    GET_RENTAL_LISTINGS_BY_OWNER_QUERY,
    {
      client: listingsApolloClient,
      variables: { owner: owner || '', limit },
      errorPolicy: 'all',
      skip: !owner
    }
  );

  // Function to fetch NFT metadata from tokenId using Doma API (reuse from existing hook)
  const fetchNFTMetadata = async (tokenId: string): Promise<NFTMetadata> => {
    try {
      const { data } = await apolloClient.query<NameFromTokenResponse, NameFromTokenVariables>({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId },
        errorPolicy: 'all'
      });

      const name = data?.nameStatistics?.name;
      if (name) {
        const [sld, tld] = name.split('.');
        return {
          name: sld || name,
          tld: tld ? `.${tld}` : '.eth',
          description: `Domain: ${name}`
        };
      } else {
        return {
          name: `Domain-${tokenId.slice(-8)}`,
          tld: '.eth',
          description: `NFT Domain with token ID: ${tokenId}`
        };
      }
    } catch (error) {
      console.error('Failed to fetch NFT metadata from Doma API:', error);
      return {
        name: `Unknown-${tokenId.slice(-8)}`,
        tld: '.eth',
        description: `Failed to fetch domain info`
      };
    }
  };

  // Fetch metadata for all listings
  useEffect(() => {
    if (!data?.rentalListings?.items?.length) {
      setListingsWithMetadata([]);
      return;
    }

    const fetchAllMetadata = async () => {
      setMetadataLoading(true);
      try {
        const listingsWithMeta = await Promise.all(
          data.rentalListings.items.map(async (listing) => {
            const metadata = await fetchNFTMetadata(listing.tokenId);
            return { ...listing, metadata };
          })
        );
        setListingsWithMetadata(listingsWithMeta);
      } catch (error) {
        console.error('Failed to fetch metadata for rental listings:', error);
        setListingsWithMetadata(data.rentalListings.items);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchAllMetadata();
  }, [data]);

  return {
    rentalListings: listingsWithMetadata,
    loading: loading || metadataLoading,
    error,
    refetch,
    totalCount: data?.rentalListings?.totalCount || 0
  };
}

// 3. Hook for User Rental History (for My Rentals section in Manage Rentals)
export function useUserRentalHistory(user?: string, limit: number = 50) {
  const [rentalHistoryWithMetadata, setRentalHistoryWithMetadata] = useState<(RentalHistory & { metadata?: NFTMetadata })[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const { data, loading, error, refetch } = useQuery<GetUserRentalHistoryResponse, GetUserRentalHistoryVariables>(
    GET_USER_RENTAL_HISTORY_QUERY,
    {
      client: listingsApolloClient,
      variables: { user: user || '', limit },
      errorPolicy: 'all',
      skip: !user
    }
  );

  // Function to fetch NFT metadata from tokenId using Doma API (reuse from existing hook)
  const fetchNFTMetadata = async (tokenId: string): Promise<NFTMetadata> => {
    try {
      const { data } = await apolloClient.query<NameFromTokenResponse, NameFromTokenVariables>({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId },
        errorPolicy: 'all'
      });

      const name = data?.nameStatistics?.name;
      if (name) {
        const [sld, tld] = name.split('.');
        return {
          name: sld || name,
          tld: tld ? `.${tld}` : '.eth',
          description: `Domain: ${name}`
        };
      } else {
        return {
          name: `Domain-${tokenId.slice(-8)}`,
          tld: '.eth',
          description: `NFT Domain with token ID: ${tokenId}`
        };
      }
    } catch (error) {
      console.error('Failed to fetch NFT metadata from Doma API:', error);
      return {
        name: `Unknown-${tokenId.slice(-8)}`,
        tld: '.eth',
        description: `Failed to fetch domain info`
      };
    }
  };

  // Fetch metadata for all rental history items
  useEffect(() => {
    if (!data?.rentalHistorys?.items?.length) {
      setRentalHistoryWithMetadata([]);
      return;
    }

    const fetchAllMetadata = async () => {
      setMetadataLoading(true);
      try {
        const historyWithMeta = await Promise.all(
          data.rentalHistorys.items.map(async (historyItem) => {
            const metadata = await fetchNFTMetadata(historyItem.tokenId);
            return { ...historyItem, metadata };
          })
        );
        setRentalHistoryWithMetadata(historyWithMeta);
      } catch (error) {
        console.error('Failed to fetch metadata for rental history:', error);
        setRentalHistoryWithMetadata(data.rentalHistorys.items);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchAllMetadata();
  }, [data]);

  return {
    userRentalProfile: data?.userRentalProfile,
    rentalHistory: rentalHistoryWithMetadata,
    depositRecords: data?.depositRecords?.items || [],
    loading: loading || metadataLoading,
    error,
    refetch,
    totalRentals: data?.rentalHistorys?.totalCount || 0,
    totalDeposits: data?.depositRecords?.totalCount || 0
  };
}
