'use client'

import { useEffect, useState } from 'react'
import { useAuctionQuery, useConvertAuctionData } from '@/hooks/useAuctionQuery'
import type { Auction, Domain, Bid } from '@/types'

function getCurrentDutchPrice(auction: Auction): number {
  if (!auction.parameters.dutch) return 0
  
  const { startPriceUsd, floorPriceUsd, durationSec } = auction.parameters.dutch
  const startTime = new Date(auction.startTime).getTime()
  const now = Date.now()
  const elapsed = now - startTime
  const progress = Math.min(elapsed / (durationSec * 1000), 1)
  
  return Math.max(
    startPriceUsd - (startPriceUsd - floorPriceUsd) * progress,
    floorPriceUsd
  )
}

function getAuctionStatus(auction: Auction) {
  return { isActive: auction.status === 'active' }
}

export function useAuctionData(auctionId: string) {
  // Use blockchain data instead of API
  const auctionQuery = useAuctionQuery(auctionId)
  const { auction, domain, bids, loading, error } = useConvertAuctionData(auctionQuery)
  
  // Mock data for related auctions and other UI state
  const [relatedAuctions, setRelatedAuctions] = useState<Auction[]>([])
  const [allDomains, setAllDomains] = useState<Domain[]>([])
  const [alerts, setAlerts] = useState({
    outbid: false,
    fiveMinutes: false,
    revealStart: false,
  })
  const [bidAmount, setBidAmount] = useState('')
  const [watchers, setWatchers] = useState(0)

  useEffect(() => {
    if (auction && !loading) {
      // Mock related auctions and watchers
      setRelatedAuctions([]) // Empty for now - you can implement this later
      setAllDomains([domain].filter(Boolean) as Domain[])
      setWatchers(Math.floor(Math.random() * 50) + 10)
    }
  }, [auction, domain, loading])

  const handlePlaceBid = async () => {
    if (!auction || !bidAmount) return
    try {
      console.log(`Placing bid of $${bidAmount} on auction ${auctionId}`)
      setBidAmount('')
    } catch (e) {
      console.error('Failed to place bid:', e)
    }
  }

  const handleCommitBid = async () => {
    if (!auction || !bidAmount) return
    try {
      setBidAmount('')
    } catch (e) {
      console.error('Failed to commit bid:', e)
    }
  }

  const handleRevealBid = async () => {
    console.log('Revealing bid for sealed auction')
  }

  const isDutch = auction?.type === 'dutch'
  const isSealed = auction?.type === 'sealed'
  const currentPrice =
    auction && isDutch && auction.parameters.dutch
      ? getCurrentDutchPrice(auction)
      : auction?.parameters.sealed?.minDepositUsd || 0

  const auctionStatus = auction ? getAuctionStatus(auction) : { isActive: false }
  return {
    loading,
    error,
    auction,
    domain,
    bids,
    relatedAuctions,
    allDomains,
    watchers,
    alerts,
    setAlerts,
    bidAmount,
    setBidAmount,
    handlePlaceBid,
    handleCommitBid,
    handleRevealBid,
    isDutch,
    isSealed,
    currentPrice,
    auctionStatus,
  }
}
