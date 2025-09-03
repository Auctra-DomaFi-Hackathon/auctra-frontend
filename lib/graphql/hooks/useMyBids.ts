'use client'

import { useQuery } from '@apollo/client'
import { useAccount } from 'wagmi'
import { GET_USER_BIDS_QUERY } from '../queries'
import { listingsApolloClient } from '../client'

export function useMyBids(limit: number = 10) {
  const { address } = useAccount()

  const { data, loading, error, refetch } = useQuery(GET_USER_BIDS_QUERY, {
    client: listingsApolloClient,
    variables: {
      userAddress: address?.toLowerCase() || '',
      limit,
      orderBy: 'timestamp',
      orderDirection: 'desc',
    },
    skip: !address,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  })

  console.log('useMyBids - address:', address)
  console.log('useMyBids - data:', data)
  console.log('useMyBids - loading:', loading)
  console.log('useMyBids - error:', error)

  return {
    bids: data?.bids?.items || [],
    pageInfo: data?.bids?.pageInfo,
    totalCount: data?.bids?.totalCount || 0,
    loading,
    error,
    refetch,
  }
}
