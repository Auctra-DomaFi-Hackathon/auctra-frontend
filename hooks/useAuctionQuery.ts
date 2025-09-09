'use client'

import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_AUCTION_HOUSE_ABI, FEE_MANAGER_ABI } from './contracts/abis'

export interface BlockchainAuction {
  listingId: string
  seller: string
  nft: string
  tokenId: string
  paymentToken: string
  reservePrice: string
  startTime: number
  endTime: number
  strategy: string
  strategyData: string
  eligibilityData: string
  status: number
}

export interface AuctionData {
  auction: BlockchainAuction | null
  highestBid: {
    bidder: string
    amount: string
  } | null
  loading: boolean
  error: string | null
}

export function useAuctionQuery(listingId: string): AuctionData {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get auction listing data
  const { data: listingData, isError: listingError, isLoading: listingLoading } = useReadContract({
    address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
    abi: DOMAIN_AUCTION_HOUSE_ABI,
    functionName: 'listings',
    args: listingId ? [BigInt(listingId)] : undefined,
    query: {
      enabled: !!listingId,
    },
  })

  // Get highest bid
  const { data: bidData, isError: bidError, isLoading: bidLoading } = useReadContract({
    address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
    abi: DOMAIN_AUCTION_HOUSE_ABI,
    functionName: 'getHighestBid',
    args: listingId ? [BigInt(listingId)] : undefined,
    query: {
      enabled: !!listingId,
    },
  })

  const [auctionData, setAuctionData] = useState<AuctionData>({
    auction: null,
    highestBid: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    setLoading(listingLoading || bidLoading)
    
    if (listingError || bidError) {
      setError('Failed to load auction data from blockchain')
      setLoading(false)
      return
    }

    if (listingData && !listingLoading) {
      try {
        // Parse listing data from contract response
        const [seller, nft, tokenId, paymentToken, reservePrice, startTime, endTime, strategy, strategyData, eligibilityData, status] = listingData as unknown as any[]
        
        const auction: BlockchainAuction = {
          listingId,
          seller,
          nft,
          tokenId: tokenId.toString(),
          paymentToken,
          reservePrice: reservePrice.toString(),
          startTime: Number(startTime),
          endTime: Number(endTime),
          strategy,
          strategyData,
          eligibilityData,
          status: Number(status)
        }

        let highestBid = null
        if (bidData && Array.isArray(bidData) && bidData.length >= 2) {
          const [bidder, amount] = bidData
          highestBid = {
            bidder,
            amount: amount.toString()
          }
        }

        setAuctionData({
          auction,
          highestBid,
          loading: false,
          error: null
        })
      } catch (err) {
        setError('Failed to parse auction data')
        setLoading(false)
      }
    }
  }, [listingId, listingData, bidData, listingLoading, bidLoading, listingError, bidError])

  return auctionData
}

// Helper hook to convert blockchain auction to UI format
export function useConvertAuctionData(auctionData: AuctionData) {
  const { auction, highestBid, loading, error } = auctionData
  
  if (!auction || loading || error) {
    return { auction: null, domain: null, bids: [], loading, error }
  }

  // Convert to UI format
  const uiAuction = {
    id: auction.listingId,
    domainId: auction.tokenId,
    type: 'english' as const, // You can determine this from strategy address
    status: auction.status === 0 ? 'pending' : auction.status === 1 ? 'active' : 'ended',
    startTime: new Date(auction.startTime * 1000).toISOString(),
    endTime: new Date(auction.endTime * 1000).toISOString(),
    revealStart: null,
    revealEnd: null,
    parameters: {
      dutch: null,
      sealed: null,
    },
    feesBps: { protocol: 250, creator: 250 },
    antiSnipingExtensionSec: 300,
    activity: [],
  }

  const domain = {
    id: auction.tokenId,
    name: `Domain #${auction.tokenId}`, // You might want to fetch this from contract
    tld: '.doma',
    status: 'active' as const,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    owner: auction.seller,
    dnsVerified: true,
    trafficScore: 85,
    renewalCostUsd: 12,
    oracleReserveUsd: Number(auction.reservePrice) / 1e18, // Convert from Wei
    fairValueBandUsd: {
      min: (Number(auction.reservePrice) / 1e18) * 0.8,
      max: (Number(auction.reservePrice) / 1e18) * 1.2,
    },
    oracleConfidence: 0.85,
    nftTokenId: auction.tokenId,
    currentAuctionId: auction.listingId,
  }

  const bids = highestBid ? [{
    id: '1',
    auctionId: auction.listingId,
    bidder: highestBid.bidder,
    amount: Number(highestBid.amount) / 1e18,
    timestamp: new Date().toISOString(),
    txHash: '',
  }] : []

  return {
    auction: uiAuction,
    domain,
    bids,
    loading,
    error
  }
}