'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatEther } from 'ethers'
import { usePlaceBid, useDutchAuctionPurchase, useCommitSealedBid } from '@/hooks/useAuction'
import { getStrategyName } from '@/lib/utils/strategy'
import { formatTransactionError } from '@/lib/utils/auction'
import BidSuccessDialog from './BidSuccessDialog'
import type { Listing, NFTMetadata } from '@/lib/graphql/types'

interface BidDialogProps {
  isOpen: boolean
  onClose: (forceReset?: boolean) => void
  listing: (Listing & { metadata?: NFTMetadata }) | null
}

function BidDialogInner({ isOpen, onClose, listing }: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('') // For sealed bid
  const [error, setError] = useState('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successBidAmount, setSuccessBidAmount] = useState('')
  const [successBidType, setSuccessBidType] = useState<'bid' | 'purchase' | 'commit'>('bid')
  const [lastProcessedHash, setLastProcessedHash] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false) // Local loading state for immediate feedback
  const [inlineSuccessShown, setInlineSuccessShown] = useState(false) // Track if inline success was shown
  
  // Manual transaction tracking - independent of wagmi state
  const [manualTransactionStates, setManualTransactionStates] = useState<{
    [key: string]: {
      isSuccess: boolean
      hash: string
      bidAmount: string
      bidType: string
      timestamp: number
    }
  }>({})
  
  // Generate unique key for each bid attempt
  const [currentBidKey, setCurrentBidKey] = useState<string | null>(null)

  // Hooks for different auction types
  const { placeBidEnglish, isPending: englishPending, isSuccess: englishSuccess, hash: englishHash } = usePlaceBid()
  const { purchaseDutchAuction, isPending: dutchPending, isSuccess: dutchSuccess, hash: dutchHash } = useDutchAuctionPurchase()
  const { commitBid, isPending: sealedPending, isSuccess: sealedSuccess, hash: sealedHash } = useCommitSealedBid()

  // Handle success states
  const isLoading = englishPending || dutchPending || sealedPending
  const isSuccessful = englishSuccess || dutchSuccess || sealedSuccess
  const successHash = englishSuccess ? englishHash : dutchSuccess ? dutchHash : sealedSuccess ? sealedHash : undefined

  // Get strategy info
  const strategyName = listing ? getStrategyName(listing.strategy) : ''
  const isEnglish = strategyName === 'English Auction'
  const isDutch = strategyName === 'Dutch Auction'
  const isSealed = strategyName === 'Sealed Bid Auction'
  const isStrategySet = listing?.strategy && listing.strategy !== '0x0000000000000000000000000000000000000000'

  // Track wagmi success states and convert to manual tracking
  useEffect(() => {
    console.log('🔍 Wagmi State Check:', {
      isSuccessful,
      isLoading,
      successHash,
      currentBidKey,
      manualStates: Object.keys(manualTransactionStates)
    })

    // Convert wagmi success to manual tracking
    if (isSuccessful && !isLoading && successHash && currentBidKey) {
      const existingState = manualTransactionStates[currentBidKey]
      
      if (!existingState || !existingState.isSuccess) {
        console.log('✅ Recording new successful transaction:', currentBidKey)
        
        const newState = {
          isSuccess: true,
          hash: successHash,
          bidAmount: bidAmount || depositAmount,
          bidType: isDutch ? 'purchase' : isSealed ? 'commit' : 'bid',
          timestamp: Date.now()
        }
        
        setManualTransactionStates(prev => ({
          ...prev,
          [currentBidKey]: newState
        }))
        
        // Clear any previous success state before showing new one
        setShowSuccessDialog(false)
        setTimeout(() => {
          console.log('✅ Showing success dialog for:', currentBidKey)
          setShowSuccessDialog(true)
          setSuccessBidAmount(newState.bidAmount)
          setSuccessBidType(newState.bidType as 'bid' | 'purchase' | 'commit')
        }, 100)
      }
    }
  }, [isSuccessful, isLoading, successHash, currentBidKey, bidAmount, depositAmount, isDutch, isSealed])

  // Show success dialog based on manual tracking instead of wagmi state
  useEffect(() => {
    if (!currentBidKey) return
    
    const currentState = manualTransactionStates[currentBidKey]
    console.log('🎭 Manual State Check:', { currentBidKey, currentState, showSuccessDialog })
    
    if (currentState && currentState.isSuccess && !showSuccessDialog) {
      console.log('✅ Showing success dialog from manual tracking')
      setShowSuccessDialog(true)
      setSuccessBidAmount(currentState.bidAmount)
      setSuccessBidType(currentState.bidType as 'bid' | 'purchase' | 'commit')
    }
  }, [currentBidKey, manualTransactionStates, showSuccessDialog])

  // Clear wagmi states when needed
  const clearWagmiStates = () => {
    console.log('🧹 Attempting to clear wagmi states')
    // Note: We can't directly clear wagmi states, but we can work around them
    // by ensuring our manual tracking takes precedence
  }

  // Reset function to clear all state
  const resetDialogState = () => {
    console.log('🔄 Resetting all dialog state')
    setBidAmount('')
    setDepositAmount('')
    setError('')
    setShowSuccessDialog(false)
    setSuccessBidAmount('')
    setIsSubmitting(false)
    setInlineSuccessShown(false)
    setCurrentBidKey(null)
    
    // Clean up old manual transaction states (keep only recent ones)
    const now = Date.now()
    setManualTransactionStates(prev => {
      const filtered: typeof prev = {}
      Object.entries(prev).forEach(([key, state]) => {
        // Keep states from last 5 minutes only
        if (now - state.timestamp < 5 * 60 * 1000) {
          filtered[key] = state
        }
      })
      return filtered
    })
  }

  // Handle dialog open/close state
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens to ensure clean start
      console.log('🚪 Dialog opened, ensuring clean state')
      setShowSuccessDialog(false)
      setSuccessBidAmount('')
      setSuccessBidType('bid')
      setError('')
      setCurrentBidKey(null)
    } else {
      // Also reset when dialog closes
      console.log('🔄 Dialog closed, resetting state')
      resetDialogState()
      // Clear processed hash after dialog closes to allow fresh bids
      setTimeout(() => {
        setLastProcessedHash(null)
      }, 1000)
    }
  }, [isOpen])

  // Reset submitting state when transaction completes or fails
  useEffect(() => {
    if (!isLoading && (isSuccessful || error)) {
      setIsSubmitting(false)
    }
  }, [isLoading, isSuccessful, error])

  // Auto-clear old manual states periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setManualTransactionStates(prev => {
        const filtered: typeof prev = {}
        Object.entries(prev).forEach(([key, state]) => {
          // Keep states from last 10 minutes
          if (now - state.timestamp < 10 * 60 * 1000) {
            filtered[key] = state
          }
        })
        return Object.keys(filtered).length !== Object.keys(prev).length ? filtered : prev
      })
    }, 60000) // Run every minute
    
    return () => clearInterval(interval)
  }, [])


  if (!listing) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Generate unique key for this bid attempt
    const bidKey = `bid_${listing.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`
    setCurrentBidKey(bidKey)
    
    // Force clear any previous success states and data when starting new bid
    console.log('🚀 Starting new bid with key:', bidKey)
    setShowSuccessDialog(false)
    setSuccessBidAmount('')
    setSuccessBidType('bid')
    
    // Clear old manual states that might interfere
    setManualTransactionStates(prev => {
      const filtered: typeof prev = {}
      Object.entries(prev).forEach(([key, state]) => {
        // Only keep very recent states (last 2 minutes)
        if (Date.now() - state.timestamp < 2 * 60 * 1000) {
          filtered[key] = state
        }
      })
      return filtered
    })
    
    if (!isStrategySet) {
      setError('Strategy not set yet. Cannot place bid.')
      setIsSubmitting(false)
      return
    }

    try {
      const listingId = BigInt(listing.id)

      if (isEnglish) {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError('Please enter a valid bid amount')
          setIsSubmitting(false)
          return
        }
        await placeBidEnglish(listingId, bidAmount)
        
      } else if (isDutch) {
        // For Dutch auction, we need current price
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError('Please enter current price amount')
          setIsSubmitting(false)
          return
        }
        await purchaseDutchAuction(listingId, bidAmount)
        
      } else if (isSealed) {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError('Please enter a valid bid amount')
          setIsSubmitting(false)
          return
        }
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
          setError('Please enter a valid deposit amount')
          setIsSubmitting(false)
          return
        }
        await commitBid(listingId, bidAmount, depositAmount)
      }
      
      // Don't reset isSubmitting here, let it be handled by loading states
    } catch (error: any) {
      const formattedError = formatTransactionError(error)
      setError(formattedError)
      setIsSubmitting(false)
    }
  }

  const formatPrice = (priceWei: string) => {
    try {
      return `${parseFloat(formatEther(priceWei)).toLocaleString()} ETH`
    } catch {
      return `${priceWei} wei`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDutch ? 'Purchase' : 'Place Bid'}
            <Badge 
              variant={isStrategySet ? "default" : "outline"} 
              className={isStrategySet ? "bg-purple-100 text-purple-700" : "text-gray-500"}
            >
              {strategyName}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Listing Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {listing.metadata?.name || `Token #${listing.tokenId.slice(-8)}`}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {listing.metadata?.tld || '.eth'}
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reserve Price:</span>
              <span className="font-medium">{formatPrice(listing.reservePrice)}</span>
            </div>
          </div>

          <Separator />

          {!isStrategySet ? (
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm">
                Strategy not set yet. This listing is not ready for bidding.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* English Auction */}
              {isEnglish && (
                <div className="space-y-2">
                  <Label htmlFor="bidAmount" className="flex items-center gap-2">
                    Your Bid Amount (ETH)
                    <Image src="/images/logo/domaLogo.svg" alt="Doma" className="h-4 w-4" width={20} height={20}/>
                  </Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    step="0.00001"
                    min="0.00001"
                    placeholder="0.0001"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(e.target.value)
                      // Clear success dialog when user starts typing new amount
                      if (showSuccessDialog) {
                        console.log('🔄 User typing new bid - clearing success dialog')
                        setShowSuccessDialog(false)
                      }
                    }}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Enter your bid amount. Must be higher than current highest bid.
                  </p>
                </div>
              )}

              {/* Dutch Auction */}
              {isDutch && (
                <div className="space-y-2">
                  <Label htmlFor="bidAmount" className="flex items-center gap-2">
                    Current Price (ETH)
                    <img src="/images/logo/domaLogo.svg" alt="Doma" className="h-4 w-4" />
                  </Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    step="0.00001"
                    min="0.00001"
                    placeholder="0.0001"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(e.target.value)
                      // Clear success dialog when user starts typing new amount
                      if (showSuccessDialog) {
                        console.log('🔄 User typing new bid - clearing success dialog')
                        setShowSuccessDialog(false)
                      }
                    }}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Dutch auctions have declining prices. First to pay wins!
                  </p>
                </div>
              )}

              {/* Sealed Bid Auction */}
              {isSealed && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount" className="flex items-center gap-2">
                      Hidden Bid Amount (ETH)
                      <img src="/images/logo/domaLogo.svg" alt="Doma" className="h-4 w-4" />
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.00001"
                      min="0.00001"
                      placeholder="0.001"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value)
                        // Clear success dialog when user starts typing new amount
                        if (showSuccessDialog) {
                          console.log('🔄 User typing new bid - clearing success dialog')
                          setShowSuccessDialog(false)
                        }
                      }}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      Your actual bid amount (kept secret until reveal phase).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depositAmount" className="flex items-center gap-2">
                      Deposit Amount (ETH)
                      <img src="/images/logo/domaLogo.svg" alt="Doma" className="h-4 w-4" />
                    </Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      step="0.00001"
                      min="0.00001"
                      placeholder="0.0001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      Minimum deposit to commit your bid. Refunded if you dont win.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting || isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={(isSubmitting || isLoading) || !bidAmount || (isSealed && !depositAmount)}
                  className="flex-1 relative"
                >
                  {(isSubmitting || isLoading) ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      {isSubmitting && !isLoading ? 'Confirming...' : 'Processing...'}
                    </div>
                  ) : (
                    isDutch ? 'Purchase Now' : isSealed ? 'Commit Bid' : 'Place Bid'
                  )}
                </Button>
              </div>
            </form>
          )}

        </div>
      </DialogContent>

      {/* Success Dialog with key-based reset */}
      {console.log('🎭 Rendering BidSuccessDialog:', { showSuccessDialog, successHash, isSuccessful })}
      <BidSuccessDialog
        key={currentBidKey || 'default'} // Force remount with new key
        isOpen={showSuccessDialog}
        onClose={() => {
          console.log('🚪 Closing BidSuccessDialog - complete state reset')
          setShowSuccessDialog(false)
          setSuccessBidAmount('')
          setSuccessBidType('bid')
          
          // Clear current bid key to prevent re-showing
          setCurrentBidKey(null)
          
          // Clean manual states to prevent reappearance
          setManualTransactionStates({})
          
          // Force component reset to clear all wagmi states
          onClose(true) // Pass true to trigger force reset
        }}
        listing={listing}
        transactionHash={currentBidKey ? manualTransactionStates[currentBidKey]?.hash || successHash : successHash}
        bidAmount={successBidAmount || bidAmount || depositAmount}
        bidType={successBidType}
      />
    </Dialog>
  )
}

// Main interface without forceReset parameter for external usage
interface MainBidDialogProps {
  isOpen: boolean
  onClose: () => void
  listing: (Listing & { metadata?: NFTMetadata }) | null
}

// Wrapper component with key-based reset mechanism
export default function BidDialog({ isOpen, onClose, listing }: MainBidDialogProps) {
  const [componentKey, setComponentKey] = useState(0)
  
  // Force remount component when success dialog is closed to reset all wagmi states
  const handleForceReset = () => {
    console.log('🔄 Force resetting BidDialog component')
    setComponentKey(prev => prev + 1)
  }
  
  return (
    <BidDialogInner
      key={componentKey}
      isOpen={isOpen}
      onClose={(forceReset?: boolean) => {
        if (forceReset) {
          handleForceReset()
        }
        onClose()
      }}
      listing={listing}
    />
  )
}