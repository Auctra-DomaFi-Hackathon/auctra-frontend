'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { graphqlService, type EnhancedDomainItem } from './services';
import { GET_ACTIVE_LISTINGS_QUERY, GET_NAME_FROM_TOKEN_QUERY, GET_ALL_ACTIVE_RENTAL_LISTINGS_QUERY, GET_LISTING_DETAILS_QUERY, GET_RENTAL_LISTINGS_BY_OWNER_QUERY, GET_USER_RENTAL_HISTORY_QUERY } from './queries';
import { listingsApolloClient, apolloClient } from './client';
import type { GetActiveListingsResponse, GetActiveListingsVariables, Listing, NFTMetadata, NameFromTokenResponse, NameFromTokenVariables, GetAllActiveRentalListingsResponse, GetAllActiveRentalListingsVariables, GetListingDetailsResponse, GetListingDetailsVariables, GetRentalListingsByOwnerResponse, GetRentalListingsByOwnerVariables, GetUserRentalHistoryResponse, GetUserRentalHistoryVariables, RentalListingWithMetadata, RentalHistory } from './types';

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

export function useActiveListings(limit: number = 10) {
  const [listingsWithMetadata, setListingsWithMetadata] = useState<(Listing & { metadata?: NFTMetadata })[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const { data, loading, error, refetch } = useQuery<GetActiveListingsResponse, GetActiveListingsVariables>(
    GET_ACTIVE_LISTINGS_QUERY,
    {
      client: listingsApolloClient,
      variables: { limit },
      errorPolicy: 'all'
    }
  );

  // Function to fetch NFT metadata from tokenId using Doma API
  const fetchNFTMetadata = async (tokenId: string): Promise<NFTMetadata> => {
    try {
      const { data } = await apolloClient.query<NameFromTokenResponse, NameFromTokenVariables>({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId },
        errorPolicy: 'all'
      });

      const name = data?.nameStatistics?.name;
      if (name) {
        // Split domain name to get SLD and TLD
        const [sld, tld] = name.split('.');
        return {
          name: sld || name,
          tld: tld ? `.${tld}` : '.eth',
          description: `Domain: ${name}`
        };
      } else {
        // Fallback if name not found
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
    if (!data?.listings?.items?.length) {
      setListingsWithMetadata([]);
      return;
    }

    const fetchAllMetadata = async () => {
      setMetadataLoading(true);
      try {
        const listingsWithMeta = await Promise.all(
          data.listings.items.map(async (listing) => {
            const metadata = await fetchNFTMetadata(listing.tokenId);
            return { ...listing, metadata };
          })
        );
        setListingsWithMetadata(listingsWithMeta);
      } catch (error) {
        console.error('Failed to fetch metadata for listings:', error);
        setListingsWithMetadata(data.listings.items);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchAllMetadata();
  }, [data]);

  return {
    listings: listingsWithMetadata,
    loading: loading || metadataLoading,
    error,
    refetch,
    pageInfo: data?.listings?.pageInfo
  };
}

// RENTAL HOOKS - From CLAUDE.md requirements

// 1. Hook for Active Domain Rentals (for /app/rent page)
export function useActiveRentalListings(limit: number = 50) {
  const [rentalListingsWithMetadata, setRentalListingsWithMetadata] = useState<RentalListingWithMetadata[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const { data, loading, error, refetch } = useQuery<GetAllActiveRentalListingsResponse, GetAllActiveRentalListingsVariables>(
    GET_ALL_ACTIVE_RENTAL_LISTINGS_QUERY,
    {
      client: listingsApolloClient,
      variables: { limit },
      errorPolicy: 'all',
      onCompleted: (data) => {
        console.log('🔍 Rental listings query completed:', data);
      },
      onError: (error) => {
        console.error('❌ Rental listings query error:', error);
      }
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
        setRentalListingsWithMetadata(activeListings);
        console.log(`✅ Fetched ${listingsWithMeta.length} total listings, ${activeListings.length} active`);
      } catch (error) {
        console.error('Failed to fetch metadata for rental listings:', error);
        setRentalListingsWithMetadata(data.rentalListings.items);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchAllMetadata();
  }, [data]);

  return {
    rentalListings: rentalListingsWithMetadata,
    allListings: rentalListingsWithMetadata,
    loading: loading || metadataLoading,
    error,
    refetch
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
