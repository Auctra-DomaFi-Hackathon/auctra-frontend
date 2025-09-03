'use client'

import * as React from 'react'
import { useAccount } from 'wagmi'
import { groupBy, dayKey } from '../utils/date'
import { MOCK } from '../utils/mock'
import { useAuctionHistory } from '@/lib/graphql/hooks/useAuctionHistory'
import { getStrategyName } from '@/lib/utils/strategy'
import type { ActivityItem, EventKind } from '../utils/types'

export function useHistoryData() {
  const [search, setSearch] = React.useState('')
  const [active, setActive] = React.useState<EventKind | 'All'>('All')
  const [loading, setLoading] = React.useState(true)
  
  const { address } = useAccount()
  
  // Fetch auction history from GraphQL
  const {
    auctions: graphqlAuctions,
    loading: auctionsLoading,
    error: auctionsError,
  } = useAuctionHistory(20)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600) // simulate fetch
    return () => clearTimeout(t)
  }, [])

  // Transform GraphQL auctions to ActivityItem format
  const auctionActivities = React.useMemo((): ActivityItem[] => {
    if (!address || !graphqlAuctions || graphqlAuctions.length === 0) {
      return []
    }

    return graphqlAuctions.map((auction: any) => {
      // Get proper domain name from metadata
      const domainName = auction.metadata?.name 
        ? `${auction.metadata.name}${auction.metadata.tld || '.doma'}`
        : `Token #${auction.tokenId.slice(-8)}`

      // Convert wei to ETH for prices
      const reservePrice = auction.reservePrice ? 
        (parseFloat(auction.reservePrice) / 1e18).toFixed(4) : '0'

      // Get auction type from strategy
      const auctionType = getStrategyName(auction.strategy)
      
      // Format created date
      const createdDate = auction.createdAt ? 
        new Date(parseInt(auction.createdAt) * 1000) : 
        new Date()

      return {
        id: `auction-${auction.id}`,
        kind: 'Auctions' as EventKind,
        title: 'Auction created',
        subtitle: `${auctionType} • reserve ${reservePrice} ETH`,
        domain: domainName,
        amount: `${reservePrice} ETH`,
        time: createdDate.toISOString(),
        status: auction.status,
        meta: {
          auctionId: auction.id,
          tokenId: auction.tokenId,
          strategy: auction.strategy,
          winningBid: auction.winningBid,
          winner: auction.winner,
        }
      }
    })
  }, [graphqlAuctions, address])

  // Combine real auction data with mock data for other activities
  const allActivities = React.useMemo(() => {
    if (address) {
      // If wallet connected, use real auction data + mock for other types
      const otherMockData = MOCK.filter(item => item.kind !== 'Auctions')
      return [...auctionActivities, ...otherMockData]
    } else {
      // If no wallet, show all mock data
      return MOCK
    }
  }, [auctionActivities, address])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return allActivities.filter((e) => {
      const okFilter = active === 'All' ? true : e.kind === active
      const okSearch =
        q.length === 0 ||
        [e.title, e.subtitle, e.domain, e.amount]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      return okFilter && okSearch
    }).sort((a, b) => +new Date(b.time) - +new Date(a.time))
  }, [search, active, allActivities])

  const grouped = React.useMemo(() => groupBy(filtered, (i: ActivityItem) => dayKey(i.time)), [filtered])

  // Loading state includes auction loading
  const isLoading = loading || (address && auctionsLoading)

  console.log('useHistoryData - auction activities:', auctionActivities)
  console.log('useHistoryData - all activities:', allActivities)
  console.log('useHistoryData - filtered:', filtered)

  return { 
    search, 
    setSearch, 
    active, 
    setActive, 
    loading: isLoading, 
    grouped, 
    flat: filtered,
    auctionsError 
  }
}
