'use client'

import { useQuery } from '@apollo/client'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { GET_USER_BID_HISTORY_QUERY, GET_NAME_FROM_TOKEN_QUERY, GET_ACTIVE_LISTINGS_QUERY } from '../queries'
import { listingsApolloClient, apolloClient } from '../client'
import type { NFTMetadata, NameFromTokenResponse, NameFromTokenVariables } from '../types'

export interface UserBid {
  id: string
  listingId: string
  bidder: string
  amount: string
  timestamp: string
  blockNumber?: string
  transactionHash?: string
  // Enhanced with metadata
  listing?: {
    id: string
    seller: string
    status: string
    strategy: string
    tokenId: string
    reservePrice: string
  }
  metadata?: NFTMetadata
}

export interface UserBidsData {
  bids: UserBid[]
  loading: boolean
  error: any
  refetch: () => void
}

export function useUserBids(): UserBidsData {
  const { address } = useAccount()
  const [bidsWithMetadata, setBidsWithMetadata] = useState<UserBid[]>([])
  const [metadataLoading, setMetadataLoading] = useState(false)

  const { data, loading, error, refetch } = useQuery(GET_USER_BID_HISTORY_QUERY, {
    client: listingsApolloClient,
    variables: {
      bidder: address?.toLowerCase() || '',
    },
    skip: !address,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  })

  // Function to fetch NFT metadata from tokenId using Doma API
  const fetchNFTMetadata = async (tokenId: string): Promise<NFTMetadata> => {
    try {
      const { data: metadataData } = await apolloClient.query<NameFromTokenResponse, NameFromTokenVariables>({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId },
        errorPolicy: 'all'
      });

      const name = metadataData?.nameStatistics?.name;
      if (name) {
        // Split domain name to get SLD and TLD
        const [sld, tld] = name.split('.');
        return {
          name: sld || name,
          tld: tld ? `.${tld}` : '.doma',
          description: `Domain: ${name}`
        };
      } else {
        // Fallback if name not found
        return {
          name: `Domain-${tokenId.slice(-8)}`,
          tld: '.doma',
          description: `NFT Domain with token ID: ${tokenId}`
        };
      }
    } catch (error) {
      console.error('Failed to fetch NFT metadata from Doma API:', error);
      return {
        name: `Unknown-${tokenId.slice(-8)}`,
        tld: '.doma',
        description: `Failed to fetch domain info`
      };
    }
  };

  // Function to fetch listing details for each bid
  const fetchListingDetails = async (listingId: string) => {
    try {
      const { data: listingData } = await listingsApolloClient.query({
        query: GET_ACTIVE_LISTINGS_QUERY,
        variables: {},
        errorPolicy: 'all'
      });

      // Find the listing by ID from all listings
      const listing = listingData?.listings?.items?.find((l: any) => l.id === listingId);
      return listing || null;
    } catch (error) {
      console.error(`Failed to fetch listing details for ${listingId}:`, error);
      return null;
    }
  };

  // Enhanced bids with metadata and listing details
  useEffect(() => {
    if (!data?.bids?.items?.length) {
      setBidsWithMetadata([]);
      return;
    }

    const enhanceBids = async () => {
      setMetadataLoading(true);
      try {
        const enhancedBids = await Promise.all(
          data.bids.items.map(async (bid: any) => {
            // Fetch listing details
            const listing = await fetchListingDetails(bid.listingId);
            
            // Fetch metadata if listing found
            let metadata = undefined;
            if (listing?.tokenId) {
              metadata = await fetchNFTMetadata(listing.tokenId);
            }

            return {
              ...bid,
              listing,
              metadata
            };
          })
        );
        setBidsWithMetadata(enhancedBids);
      } catch (error) {
        console.error('Failed to enhance bids with metadata:', error);
        setBidsWithMetadata(data.bids.items);
      } finally {
        setMetadataLoading(false);
      }
    };

    enhanceBids();
  }, [data]);

  console.log('useUserBids - address:', address)
  console.log('useUserBids - data:', data)
  console.log('useUserBids - bidsWithMetadata:', bidsWithMetadata)
  console.log('useUserBids - loading:', loading || metadataLoading)
  console.log('useUserBids - error:', error)

  return {
    bids: bidsWithMetadata,
    loading: loading || metadataLoading,
    error,
    refetch,
  }
}