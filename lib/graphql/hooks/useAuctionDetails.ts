'use client'

import { useQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import { GET_CURRENT_AUCTION_QUERY, GET_NAME_FROM_TOKEN_QUERY } from '../queries'
import { listingsApolloClient, apolloClient } from '../client'
import type { NFTMetadata, NameFromTokenResponse, NameFromTokenVariables } from '../types'

export interface BidItem {
  id: string
  bidder: string
  amount: string
  timestamp: string
  blockNumber?: string
  transactionHash?: string
}

export interface AuctionListing {
  id: string
  seller: string
  nft: string
  tokenId: string
  reservePrice: string
  startTime: string
  endTime: string
  status: string
  winner: string | null
  winningBid: string | null
  createdAt: string
  updatedAt: string
  strategy: string
  metadata?: NFTMetadata
}

export interface AuctionDetailsData {
  listing: AuctionListing | null
  highestBid: BidItem | null
  allBids: BidItem[]
  loading: boolean
  error: any
  refetch: () => void
}

export function useAuctionDetails(listingId: string): AuctionDetailsData {
  const [auctionWithMetadata, setAuctionWithMetadata] = useState<AuctionListing | null>(null)
  const [metadataLoading, setMetadataLoading] = useState(false)

  const { data, loading, error, refetch } = useQuery(GET_CURRENT_AUCTION_QUERY, {
    client: listingsApolloClient,
    variables: {
      listingId,
    },
    skip: !listingId,
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

  // Fetch metadata for the auction listing
  useEffect(() => {
    const listing = data?.listings?.items?.[0];
    if (!listing) {
      setAuctionWithMetadata(null);
      return;
    }

    const fetchMetadata = async () => {
      setMetadataLoading(true);
      try {
        const metadata = await fetchNFTMetadata(listing.tokenId);
        setAuctionWithMetadata({ ...listing, metadata });
      } catch (error) {
        console.error('Failed to fetch metadata for auction listing:', error);
        setAuctionWithMetadata(listing);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, [data]);

  console.log('useAuctionDetails - listingId:', listingId)
  console.log('useAuctionDetails - data:', data)
  console.log('useAuctionDetails - auctionWithMetadata:', auctionWithMetadata)
  console.log('useAuctionDetails - loading:', loading || metadataLoading)
  console.log('useAuctionDetails - error:', error)

  return {
    listing: auctionWithMetadata,
    highestBid: data?.highestBid?.items?.[0] || null,
    allBids: data?.allBids?.items || [],
    loading: loading || metadataLoading,
    error,
    refetch,
  }
}