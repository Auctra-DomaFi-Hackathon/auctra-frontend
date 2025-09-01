import type { Auction } from '@/types'

export function calculateDutchPrice(
  startPriceUsd: number,
  floorPriceUsd: number,
  durationSec: number,
  elapsedSec: number
): number {
  if (elapsedSec >= durationSec) {
    return floorPriceUsd
  }
  
  const progress = elapsedSec / durationSec
  const priceDecline = startPriceUsd - floorPriceUsd
  const currentPrice = startPriceUsd - (priceDecline * progress)
  
  return Math.max(currentPrice, floorPriceUsd)
}

export function getCurrentDutchPrice(auction: Auction): number {
  if (auction.type !== 'dutch' || !auction.parameters.dutch) {
    throw new Error('Not a Dutch auction')
  }
  
  const now = new Date().getTime()
  const start = new Date(auction.startTime).getTime()
  const elapsedMs = now - start
  const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000))
  
  return calculateDutchPrice(
    auction.parameters.dutch.startPriceUsd,
    auction.parameters.dutch.floorPriceUsd,
    auction.parameters.dutch.durationSec,
    elapsedSec
  )
}

export function getAuctionStatus(auction: Auction): {
  status: string
  timeRemaining?: number
  isActive: boolean
} {
  const now = new Date().getTime()
  const start = new Date(auction.startTime).getTime()
  const end = new Date(auction.endTime).getTime()
  
  if (now < start) {
    return {
      status: 'upcoming',
      timeRemaining: start - now,
      isActive: false
    }
  }
  
  if (now >= start && now < end) {
    return {
      status: 'active',
      timeRemaining: end - now,
      isActive: true
    }
  }
  
  if (auction.type === 'sealed' && auction.revealStart && auction.revealEnd) {
    const revealStart = new Date(auction.revealStart).getTime()
    const revealEnd = new Date(auction.revealEnd).getTime()
    
    if (now >= end && now < revealStart) {
      return {
        status: 'awaiting_reveal',
        timeRemaining: revealStart - now,
        isActive: false
      }
    }
    
    if (now >= revealStart && now < revealEnd) {
      return {
        status: 'reveal',
        timeRemaining: revealEnd - now,
        isActive: true
      }
    }
  }
  
  return {
    status: 'ended',
    isActive: false
  }
}