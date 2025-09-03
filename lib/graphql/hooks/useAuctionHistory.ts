'use client'

import { useQuery } from '@apollo/client'
import { useAccount } from 'wagmi'
import { GET_USER_AUCTION_HISTORY_QUERY } from '../queries'

export function useAuctionHistory(limit: number = 10) {
  const { address } = useAccount()

  const { data, loading, error, refetch } = useQuery(GET_USER_AUCTION_HISTORY_QUERY, {
    variables: {
      userAddress: address?.toLowerCase() || '',
      limit,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    },
    skip: !address,
    fetchPolicy: 'cache-and-network',
  })

  return {
    auctions: data?.listings?.items || [],
    pageInfo: data?.listings?.pageInfo,
    totalCount: data?.listings?.totalCount || 0,
    loading,
    error,
    refetch,
  }
}
