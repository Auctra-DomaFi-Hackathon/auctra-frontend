'use client'

import * as React from 'react'
import { useAccount } from 'wagmi'
import { groupBy, dayKey } from '../utils/date'
import { MOCK } from '../utils/mock'
import { useAuctionHistory } from '@/lib/graphql/hooks/useAuctionHistory'
import { getStrategyName } from '@/lib/utils/strategy'
import useUserLendingHistory from '@/hooks/useUserLendingHistory'
import { useUserRentalHistory } from '@/lib/graphql/hooks'
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

  // Helper function to format ETH amounts (remove unnecessary decimals)
  const formatETH = React.useCallback((value: number): string => {
    if (value % 1 === 0) {
      // If it's a whole number, don't show decimals
      return value.toString()
    } else if (value < 0.001) {
      // For very small amounts, show more decimals
      return value.toFixed(6)
    } else {
      // For normal amounts, show up to 4 decimals but remove trailing zeros
      return parseFloat(value.toFixed(4)).toString()
    }
  }, [])

  // Function to fetch NFT metadata from tokenId using Doma API (same as useAuctionHistory.ts)
  const fetchNFTMetadata = React.useCallback(async (tokenId: string): Promise<NFTMetadata> => {
    try {
      console.log(`🔄 Fetching metadata for tokenId: ${tokenId}`);
      const { data: metadataData } = await apolloClient.query<NameFromTokenResponse, NameFromTokenVariables>({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId },
        errorPolicy: 'all',
        fetchPolicy: 'cache-first', // Use cache to prevent excessive requests
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
  }, []);
  
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

  // Fetch rental history from GraphQL
  const {
    rentalHistory,
    depositRecords,
    loading: rentalLoading,
    error: rentalError,
  } = useUserRentalHistory(address || '', 50)

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
      const reservePriceValue = auction.reservePrice ? 
        parseFloat(auction.reservePrice) / 1e18 : 0
      const reservePrice = formatETH(reservePriceValue)

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

  // State for rental activities with metadata
  const [rentalActivities, setRentalActivities] = React.useState<ActivityItem[]>([])

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

    if (supplyHistory.transactions.length > 0 || borrowHistory.transactions.length > 0 || borrowHistory.collateralHistory.length > 0) {
      transformLendingData()
    }
  }, [supplyHistory.transactions.length, borrowHistory.transactions.length, borrowHistory.collateralHistory.length, address, fetchNFTMetadata])

  // Transform rental data to ActivityItem format with async metadata fetching
  React.useEffect(() => {
    if (!address) {
      setRentalActivities([])
      return
    }

    const transformRentalData = async () => {
      const activities: ActivityItem[] = []

      console.log('🏠 Processing rental history:', rentalHistory)

      // Create a metadata cache to avoid multiple fetches for the same tokenId
      const metadataCache = new Map<string, { name: string; tld: string } | null>()

      // Group rental history by tokenId to ensure consistent naming
      const rentalsByTokenId = rentalHistory.reduce((acc, item) => {
        if (!acc[item.tokenId]) {
          acc[item.tokenId] = []
        }
        acc[item.tokenId].push(item)
        return acc
      }, {} as Record<string, any[]>)

      console.log('🏠 Rental history grouped by tokenId:', rentalsByTokenId)

      // First pass: fetch metadata for all unique tokenIds
      const uniqueTokenIds = Object.keys(rentalsByTokenId)
      for (const tokenId of uniqueTokenIds) {
        if (!metadataCache.has(tokenId)) {
          try {
            const metadata = await fetchNFTMetadata(tokenId)
            metadataCache.set(tokenId, metadata)
            console.log(`🏠 Cached rental metadata for tokenId ${tokenId}:`, metadata)
          } catch (error) {
            console.error(`❌ Failed to fetch rental metadata for tokenId ${tokenId}:`, error)
            metadataCache.set(tokenId, null)
          }
        }
      }

      // Second pass: process all rental events using cached metadata
      for (const [tokenId, items] of Object.entries(rentalsByTokenId)) {
        const metadata = metadataCache.get(tokenId)
        let domainName: string

        if (metadata && metadata.name) {
          domainName = `${metadata.name}${metadata.tld || '.doma'}`
          console.log(`🏠 Using real domain name "${domainName}" from metadata for rental tokenId: ${tokenId}`)
        } else {
          domainName = `Domain-${tokenId.slice(-8)}`
          console.warn(`🏠 Using tokenId fallback "${domainName}" for rental tokenId: ${tokenId}`)
        }

        // Process all rental events with this tokenId
        for (const item of items) {
          let title: string
          let subtitle: string
          let amount: string | undefined

          // Parse rental event data
          const eventData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data

          switch (item.eventType) {
            case 'Rented':
              title = 'Domain Rented'
              subtitle = `Rented ${domainName} for ${eventData?.days || 'N/A'} days`
              amount = eventData?.totalPaid ? `${(parseFloat(eventData.totalPaid) / 1e6).toFixed(2)} USDC` : undefined
              break
            case 'Extended':
              title = 'Rental Extended'
              subtitle = `Extended ${domainName} rental`
              break
            case 'Ended':
              title = 'Rental Ended'
              subtitle = `Rental period for ${domainName} ended`
              break
            default:
              title = 'Rental Activity'
              subtitle = `${item.eventType} - ${domainName}`
          }

          console.log(`🏠 Creating rental activity: ${title} for domain: ${domainName}`)

          activities.push({
            id: `rental-${item.id}`,
            kind: 'Renting' as EventKind,
            title,
            subtitle,
            domain: domainName,
            amount,
            time: new Date(parseInt(item.timestamp) * 1000).toISOString(),
          })
        }
      }

      // Also process deposit records
      console.log('🏠 Processing deposit records:', depositRecords)
      
      for (const deposit of depositRecords) {
        // Find corresponding rental history to get domain name
        const relatedRental = rentalHistory.find(r => r.listingId === deposit.listingId)
        let domainName = 'Unknown Domain'
        
        if (relatedRental) {
          const metadata = metadataCache.get(relatedRental.tokenId)
          if (metadata && metadata.name) {
            domainName = `${metadata.name}${metadata.tld || '.doma'}`
          } else {
            domainName = `Domain-${relatedRental.tokenId.slice(-8)}`
          }
        }

        const depositAmount = `${(parseFloat(deposit.amount) / 1e6).toFixed(2)} USDC`

        if (deposit.claimed) {
          activities.push({
            id: `deposit-claim-${deposit.id}`,
            kind: 'Renting' as EventKind,
            title: 'Security Deposit Claimed',
            subtitle: `Deposit returned for ${domainName}`,
            amount: depositAmount,
            time: new Date(parseInt(deposit.claimedAt || deposit.lockedAt) * 1000).toISOString(),
          })
        } else if (deposit.locked) {
          activities.push({
            id: `deposit-lock-${deposit.id}`,
            kind: 'Renting' as EventKind,
            title: 'Security Deposit Locked',
            subtitle: `Deposit locked for ${domainName}`,
            amount: depositAmount,
            time: new Date(parseInt(deposit.lockedAt) * 1000).toISOString(),
          })
        }
      }

      const sortedActivities = activities.sort((a, b) => +new Date(b.time) - +new Date(a.time))
      console.log('🏠 Final rental activities:', sortedActivities)
      setRentalActivities(sortedActivities)
    }

    if (rentalHistory.length > 0 || depositRecords.length > 0) {
      transformRentalData()
    }
  }, [rentalHistory.length, depositRecords.length, address, fetchNFTMetadata])

  // Combine real auction, lending, and rental data with mock data for other activities
  const allActivities = React.useMemo(() => {
    if (address) {
      // If wallet connected, use real auction + lending + rental data + mock for other types
      const otherMockData = MOCK.filter(item => 
        item.kind !== 'Auctions' && 
        item.kind !== 'Supply & Borrow' && 
        item.kind !== 'Renting'
      )
      return [...auctionActivities, ...lendingActivities, ...rentalActivities, ...otherMockData]
    } else {
      // If no wallet, show all mock data
      return MOCK
    }
  }, [auctionActivities, lendingActivities, rentalActivities, address])

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

  // Loading state includes auction, lending, and rental loading  
  const isLoading = loading || (address && (auctionsLoading || lendingLoading || rentalLoading))

  console.log('useHistoryData - auction activities:', auctionActivities)
  console.log('useHistoryData - lending activities:', lendingActivities)
  console.log('useHistoryData - rental activities:', rentalActivities)
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
    lendingError,
    rentalError
  }
}
