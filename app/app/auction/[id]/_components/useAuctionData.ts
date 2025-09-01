'use client'

import { useEffect, useState } from 'react'
import { auctionsService, domainsService, bidsService } from '@/lib/services'
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
  const [auction, setAuction] = useState<Auction | null>(null)
  const [domain, setDomain] = useState<Domain | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [relatedAuctions, setRelatedAuctions] = useState<Auction[]>([])
  const [allDomains, setAllDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState({
    outbid: false,
    fiveMinutes: false,
    revealStart: false,
  })
  const [bidAmount, setBidAmount] = useState('')
  const [watchers, setWatchers] = useState(0)

  useEffect(() => {
    const loadAuctionData = async () => {
      try {
        setLoading(true)
        const [auctionData, allAuctionsData, allDomainsData] = await Promise.all([
          auctionsService.getById(auctionId),
          auctionsService.getAll(),
          domainsService.getAll(),
        ])

        const domainData = allDomainsData.find(d => d.id === auctionData.domainId) || null
        const bidsData = await bidsService.getByAuctionId(auctionId)

        const related = allAuctionsData
          .filter(a => a.id !== auctionId && a.status === 'active')
          .slice(0, 3)

        setAuction(auctionData)
        setDomain(domainData)
        setBids(bidsData)
        setRelatedAuctions(related)
        setAllDomains(allDomainsData)
        setWatchers(Math.floor(Math.random() * 50) + 10) // mock watchers
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (auctionId) loadAuctionData()
  }, [auctionId])

  const handlePlaceBid = async () => {
    if (!auction || !bidAmount) return
    try {
      console.log(`Placing bid of $${bidAmount} on auction ${auctionId}`)
      setBidAmount('')
      // Optionally re-fetch bids
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
