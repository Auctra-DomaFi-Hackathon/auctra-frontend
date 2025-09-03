import { parseEther, formatEther } from 'viem'

export interface AuctionValidationResult {
  isValid: boolean
  error?: string
  minimumBid?: bigint
  currentPrice?: bigint
}

// Check if auction is live and validate bid amount
export async function validateAuctionBid(
  auctionHouse: any, // Contract instance
  listingId: bigint,
  bidAmountETH: string
): Promise<AuctionValidationResult> {
  try {
    // Get auction listing details
    const listing = await auctionHouse.read.listings([listingId])
    
    // Check auction status (2 = LIVE)
    if (Number(listing.status) !== 2) {
      return {
        isValid: false,
        error: 'Auction is not currently active'
      }
    }
    
    // Check if auction has ended
    const now = Math.floor(Date.now() / 1000)
    if (listing.endTime > 0 && now > Number(listing.endTime)) {
      return {
        isValid: false,
        error: 'Auction has ended'
      }
    }
    
    // Get current minimum bid
    let minimumBid: bigint
    try {
      minimumBid = await auctionHouse.read.previewCurrentPrice([listingId])
    } catch (error) {
      // Fallback to reserve price if previewCurrentPrice fails
      minimumBid = listing.reservePrice
    }
    
    // Check if bid amount is sufficient
    const bidAmountWei = parseEther(bidAmountETH)
    if (bidAmountWei < minimumBid) {
      return {
        isValid: false,
        error: `Bid too low. Minimum bid: ${formatEther(minimumBid)} ETH`,
        minimumBid,
        currentPrice: minimumBid
      }
    }
    
    return {
      isValid: true,
      minimumBid,
      currentPrice: minimumBid
    }
    
  } catch (error) {
    console.error('Error validating auction bid:', error)
    return {
      isValid: false,
      error: 'Failed to validate auction. Please try again.'
    }
  }
}

// Get eligibility data for auction (placeholder implementation)
export async function getAuctionEligibilityData(
  auctionHouse: any,
  listingId: bigint,
  userAddress: string
): Promise<`0x${string}`> {
  try {
    // Get listing details
    const listing = await auctionHouse.read.listings([listingId])
    
    // Check if there are eligibility requirements
    if (listing.eligibilityData === '0x' || listing.eligibilityData === '0x00') {
      // No eligibility requirements
      return '0x'
    }
    
    // TODO: Implement proper eligibility checking based on PLACE_BID.md
    // For now, return empty data (assuming no eligibility requirements)
    console.warn('Auction has eligibility requirements but proper checking is not implemented yet')
    return '0x'
    
  } catch (error) {
    console.error('Error getting eligibility data:', error)
    return '0x'
  }
}

// Format transaction error messages for user-friendly display
export function formatTransactionError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'
  
  // Check for common revert reasons
  if (errorMessage.includes('Auction not live')) {
    return 'This auction is not currently active'
  }
  
  if (errorMessage.includes('Bid too low') || errorMessage.includes('InvalidBid')) {
    return 'Your bid amount is too low. Please increase your bid.'
  }
  
  if (errorMessage.includes('Not eligible')) {
    return 'You are not eligible to bid on this auction'
  }
  
  if (errorMessage.includes('Insufficient payment') || errorMessage.includes('insufficient funds')) {
    return 'Insufficient ETH balance to place this bid'
  }
  
  if (errorMessage.includes('Transfer failed')) {
    return 'Transaction failed. Please check your balance and try again.'
  }
  
  if (errorMessage.includes('User denied') || errorMessage.includes('user rejected')) {
    return 'Transaction was cancelled'
  }
  
  if (errorMessage.includes('execution reverted')) {
    return 'Transaction failed. The auction may have ended or your bid may be invalid.'
  }
  
  // Return original error for debugging
  console.error('Unhandled transaction error:', error)
  return 'Transaction failed. Please try again.'
}