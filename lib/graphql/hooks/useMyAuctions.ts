'use client'

import { useQuery } from '@apollo/client'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { GET_LISTINGS_BY_SELLER_QUERY, GET_NAME_FROM_TOKEN_QUERY } from '../queries'
import { listingsApolloClient, apolloClient } from '../client'
import type { NFTMetadata, NameFromTokenResponse, NameFromTokenVariables } from '../types'

export function useMyAuctions(limit: number = 10) {
  const { address } = useAccount()
  const [auctionsWithMetadata, setAuctionsWithMetadata] = useState<any[]>([])
  const [metadataLoading, setMetadataLoading] = useState(false)

  const { data, loading, error, refetch } = useQuery(GET_LISTINGS_BY_SELLER_QUERY, {
    client: listingsApolloClient,
    variables: {
      seller: address?.toLowerCase() || '',
      limit,
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

  // Fetch metadata for all auctions
  useEffect(() => {
    if (!data?.listings?.items?.length) {
      setAuctionsWithMetadata([]);
      return;
    }

    const fetchAllMetadata = async () => {
      setMetadataLoading(true);
      try {
        const auctionsWithMeta = await Promise.all(
          data.listings.items.map(async (auction: any) => {
            const metadata = await fetchNFTMetadata(auction.tokenId);
            return { ...auction, metadata };
          })
        );
        setAuctionsWithMetadata(auctionsWithMeta);
      } catch (error) {
        console.error('Failed to fetch metadata for auctions:', error);
        setAuctionsWithMetadata(data.listings.items);
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchAllMetadata();
  }, [data]);

  console.log('useMyAuctions - address:', address)
  console.log('useMyAuctions - data:', data)
  console.log('useMyAuctions - auctionsWithMetadata:', auctionsWithMetadata)
  console.log('useMyAuctions - loading:', loading || metadataLoading)
  console.log('useMyAuctions - error:', error)

  return {
    auctions: auctionsWithMetadata,
    loading: loading || metadataLoading,
    error,
    refetch,
  }
}
