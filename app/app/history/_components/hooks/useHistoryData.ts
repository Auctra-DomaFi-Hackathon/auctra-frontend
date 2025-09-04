'use client'

import * as React from 'react'
import { useAccount } from 'wagmi'
import { groupBy, dayKey } from '../utils/date'
import { MOCK } from '../utils/mock'
import { useAuctionHistory } from '@/lib/graphql/hooks/useAuctionHistory'
import { getStrategyName } from '@/lib/utils/strategy'
import useUserLendingHistory from '@/hooks/useUserLendingHistory'
import { formatAmountToETH } from '@/lib/utils/lending'
import { GET_NAME_FROM_TOKEN_QUERY } from '@/lib/graphql/queries'
import { apolloClient } from '@/lib/graphql/client'
import type { ActivityItem, EventKind } from '../utils/types'
import type { NFTMetadata, NameFromTokenResponse, NameFromTokenVariables } from '@/lib/graphql/types'

export function useHistoryData() {
  const [search, setSearch] = React.useState('')
  const [active, setActive] = React.useState<EventKind | 'All'>('All')
  const [loading, setLoading] = React.useState(true)
  
  const { address } = useAccount()

  // Function to fetch NFT metadata from tokenId using Doma API (same as useAuctionHistory.ts)
  const fetchNFTMetadata = async (tokenId: string): Promise<NFTMetadata> => {
    try {
      console.log(`🔄 Fetching metadata for tokenId: ${tokenId}`);
      const { data: metadataData } = await apolloClient.query<NameFromTokenResponse, NameFromTokenVariables>({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId },
        errorPolicy: 'all',
        fetchPolicy: 'network-only', // Force fresh fetch
      });

      console.log(`📊 Raw metadata response for tokenId ${tokenId}:`, metadataData);

      const name = metadataData?.nameStatistics?.name;
      if (name) {
        // Split domain name to get SLD and TLD
        const [sld, tld] = name.split('.');
        const result = {
          name: sld || name,
          tld: tld ? `.${tld}` : '.doma',
          description: `Domain: ${name}`
        };
        console.log(`✅ Successfully parsed metadata for tokenId ${tokenId}:`, result);
        return result;
      } else {
        // Fallback if name not found
        console.warn(`⚠️ No name found in metadata for tokenId ${tokenId}, using fallback`);
        return {
          name: `Domain-${tokenId.slice(-8)}`,
          tld: '.doma',
          description: `NFT Domain with token ID: ${tokenId}`
        };
      }
    } catch (error) {
      console.error(`❌ Failed to fetch NFT metadata from Doma API for tokenId ${tokenId}:`, error);
      return {
        name: `Unknown-${tokenId.slice(-8)}`,
        tld: '.doma',
        description: `Failed to fetch domain info`
      };
    }
  };
  
  // Fetch auction history from GraphQL
  const {
    auctions: graphqlAuctions,
    loading: auctionsLoading,
    error: auctionsError,
  } = useAuctionHistory(20)

  // Fetch lending history from GraphQL
  const {
    supplyHistory,
    borrowHistory,
    loading: lendingLoading,
    error: lendingError,
  } = useUserLendingHistory(
    address || '',
    '0x133272720610d669Fa4C5891Ab62a302455585Dd' // DomainLendingPool address
  )

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

  // State for lending activities with metadata
  const [lendingActivities, setLendingActivities] = React.useState<ActivityItem[]>([])

  // Transform lending data to ActivityItem format with async metadata fetching
  React.useEffect(() => {
    if (!address) {
      setLendingActivities([])
      return
    }

    const transformLendingData = async () => {
      const activities: ActivityItem[] = []

      // Supply transactions
      supplyHistory.transactions.forEach((tx) => {
        const amount = parseFloat(formatAmountToETH(tx.amount, 6)) // USDC has 6 decimals
        const formattedAmount = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2) // Remove unnecessary decimals
        activities.push({
          id: `supply-${tx.id}`,
          kind: 'Supply & Borrow' as EventKind,
          title: tx.type === 'deposit' ? 'Supply' : 'Withdraw',
          subtitle: `${tx.type === 'deposit' ? 'Supplied' : 'Withdrew'} to lending pool`,
          amount: `${formattedAmount} USDC`,
          time: new Date(parseInt(tx.timestamp) * 1000).toISOString(),
          txHash: tx.transactionHash,
        })
      })

      // Borrow transactions
      borrowHistory.transactions.forEach((tx) => {
        const amount = parseFloat(formatAmountToETH(tx.amount, 6))
        const formattedAmount = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2) // Remove unnecessary decimals
        activities.push({
          id: `borrow-${tx.id}`,
          kind: 'Supply & Borrow' as EventKind,
          title: tx.type === 'borrow' ? 'Borrow' : 'Repay',
          subtitle: `${tx.type === 'borrow' ? 'Borrowed from' : 'Repaid to'} lending pool`,
          amount: `${formattedAmount} USDC`,
          time: new Date(parseInt(tx.timestamp) * 1000).toISOString(),
          txHash: tx.transactionHash,
        })
      })

      // Collateral transactions with metadata fetching
      console.log('Processing collateral transactions:', borrowHistory.collateralHistory);
      
      // Create a metadata cache to avoid multiple fetches for the same tokenId
      const metadataCache = new Map<string, { name: string; tld: string } | null>();
      
      // Group collateral transactions by tokenId to ensure consistent naming
      const collateralByTokenId = borrowHistory.collateralHistory.reduce((acc, tx) => {
        if (!acc[tx.tokenId]) {
          acc[tx.tokenId] = [];
        }
        acc[tx.tokenId].push(tx);
        return acc;
      }, {} as Record<string, any[]>);
      
      console.log('Collateral transactions grouped by tokenId:', collateralByTokenId);
      
      const collateralActivities = [];
      
      // First pass: fetch metadata for all unique tokenIds
      const uniqueTokenIds = Object.keys(collateralByTokenId);
      for (const tokenId of uniqueTokenIds) {
        if (!metadataCache.has(tokenId)) {
          try {
            const metadata = await fetchNFTMetadata(tokenId);
            metadataCache.set(tokenId, metadata);
            console.log(`📦 Cached metadata for tokenId ${tokenId}:`, metadata);
          } catch (error) {
            console.error(`❌ Failed to fetch metadata for tokenId ${tokenId}:`, error);
            console.error('Error details:', {
              message: (error as Error)?.message,
              stack: (error as Error)?.stack,
              tokenId
            });
            metadataCache.set(tokenId, null);
          }
        }
      }
      
      // Second pass: process all transactions using cached metadata
      for (const [tokenId, transactions] of Object.entries(collateralByTokenId)) {
        const metadata = metadataCache.get(tokenId);
        let domainName: string;
        
        if (metadata && metadata.name) {
          // Use fetched metadata with proper TLD handling
          let tld = metadata.tld;
          
          // If TLD is .eth, check if this is a domain-specific collection that should use .doma
          if (tld === '.eth') {
            tld = '.doma'; // Force .doma for collateral transactions in domain lending
          }
          
          domainName = `${metadata.name}${tld}`;
          console.log(`✨ Using real domain name "${domainName}" from metadata for tokenId: ${tokenId}`);
        } else {
          // Fallback naming - try to make it more descriptive
          domainName = `TokenID-${tokenId}`;
          console.warn(`🆘 Using tokenId fallback "${domainName}" for tokenId: ${tokenId} (metadata fetch failed)`);
        }
          
        console.log(`📝 Final domain name for tokenId ${tokenId}: "${domainName}"`);
        
        // Process all transactions with this tokenId using the same domain name
        for (const tx of transactions) {
          console.log(`🏗️ Creating activity for ${tx.type} with domain: ${domainName}`);
          
          collateralActivities.push({
            id: `collateral-${tx.id}`,
            kind: 'Supply & Borrow' as EventKind,
            title: tx.type === 'deposit' ? 'Collateral Deposit' : 'Collateral Withdraw',
            subtitle: tx.type === 'deposit' ? `Domain: ${domainName}` : `Withdraw collateral from lending pool`,
            domain: tx.type === 'deposit' ? domainName : undefined,
            time: new Date(parseInt(tx.timestamp) * 1000).toISOString(),
            txHash: tx.transactionHash,
          });
        }
      }

      activities.push(...collateralActivities)
      const sortedActivities = activities.sort((a, b) => +new Date(b.time) - +new Date(a.time))
      setLendingActivities(sortedActivities)
    }

    transformLendingData()
  }, [supplyHistory, borrowHistory, address])

  // Combine real auction data with real lending data and mock data for other activities
  const allActivities = React.useMemo(() => {
    if (address) {
      // If wallet connected, use real auction + lending data + mock for other types
      const otherMockData = MOCK.filter(item => 
        item.kind !== 'Auctions' && item.kind !== 'Supply & Borrow'
      )
      return [...auctionActivities, ...lendingActivities, ...otherMockData]
    } else {
      // If no wallet, show all mock data
      return MOCK
    }
  }, [auctionActivities, lendingActivities, address])

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

  // Loading state includes auction and lending loading
  const isLoading = loading || (address && (auctionsLoading || lendingLoading))

  console.log('useHistoryData - auction activities:', auctionActivities)
  console.log('useHistoryData - lending activities:', lendingActivities)
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
    auctionsError,
    lendingError
  }
}
