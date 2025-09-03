export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatAddress(address: string): string {
  if (address.length < 8) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatDomain(domain: string): string {
  return domain.toLowerCase().trim()
}

// Overload for Auction object (used by AuctionCard)
export function getCurrentDutchPrice(auction: { 
  type: 'dutch' | 'sealed' 
  parameters: { 
    dutch?: { 
      startPriceUsd: number 
      floorPriceUsd: number 
    } | null 
  }
  startTime: string
  endTime: string
}): number

// Overload for individual parameters (used by smart contracts)
export function getCurrentDutchPrice(
  startPrice: bigint,
  endPrice: bigint,
  startTime: bigint,
  endTime: bigint,
  currentTime?: bigint
): bigint

// Implementation
export function getCurrentDutchPrice(
  auctionOrStartPrice: any,
  endPrice?: bigint,
  startTime?: bigint,
  endTime?: bigint,
  currentTime?: bigint
): number | bigint {
  // Handle Auction object case
  if (typeof auctionOrStartPrice === 'object' && auctionOrStartPrice.type) {
    const auction = auctionOrStartPrice
    
    // Return 0 if not a dutch auction or missing parameters
    if (auction.type !== 'dutch' || !auction.parameters.dutch) {
      return 0
    }
    
    const { startPriceUsd, floorPriceUsd } = auction.parameters.dutch
    const startTimeMs = new Date(auction.startTime).getTime()
    const endTimeMs = new Date(auction.endTime).getTime()
    const nowMs = Date.now()
    
    // If auction hasn't started, return start price
    if (nowMs < startTimeMs) {
      return startPriceUsd
    }
    
    // If auction has ended, return floor price
    if (nowMs >= endTimeMs) {
      return floorPriceUsd
    }
    
    // Calculate current price based on linear interpolation
    const totalDuration = endTimeMs - startTimeMs
    const elapsed = nowMs - startTimeMs
    const priceDifference = startPriceUsd - floorPriceUsd
    
    // Avoid division by zero
    if (totalDuration === 0) {
      return floorPriceUsd
    }
    
    const priceDecrease = (priceDifference * elapsed) / totalDuration
    return startPriceUsd - priceDecrease
  }
  
  // Handle bigint parameters case (original function)
  const startPrice = auctionOrStartPrice as bigint
  const now = currentTime || BigInt(Math.floor(Date.now() / 1000))
  
  // If auction hasn't started, return start price
  if (now < startTime!) {
    return startPrice
  }
  
  // If auction has ended, return end price
  if (now >= endTime!) {
    return endPrice!
  }
  
  // Calculate current price based on linear interpolation
  const totalDuration = endTime! - startTime!
  const elapsed = now - startTime!
  const priceDifference = startPrice - endPrice!
  
  // Avoid division by zero
  if (totalDuration === BigInt(0)) {
    return endPrice!
  }
  
  const priceDecrease = (priceDifference * elapsed) / totalDuration
  return startPrice - priceDecrease
}