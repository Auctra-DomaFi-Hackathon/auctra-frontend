'use client'

import Image from 'next/image'
import { useState } from 'react'
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
  onClose: () => void
  listing: (Listing & { metadata?: NFTMetadata }) | null
}

export default function BidDialog({ isOpen, onClose, listing }: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('') // For sealed bid
  const [error, setError] = useState('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successBidAmount, setSuccessBidAmount] = useState('')
  const [successBidType, setSuccessBidType] = useState<'bid' | 'purchase' | 'commit'>('bid')

  // Hooks for different auction types
  const { placeBidEnglish, isPending: englishPending, isSuccess: englishSuccess, hash: englishHash } = usePlaceBid()
  const { purchaseDutchAuction, isPending: dutchPending, isSuccess: dutchSuccess, hash: dutchHash } = useDutchAuctionPurchase()
  const { commitBid, isPending: sealedPending, isSuccess: sealedSuccess, hash: sealedHash } = useCommitSealedBid()

  if (!listing) return null

  const strategyName = getStrategyName(listing.strategy)
  const isEnglish = strategyName === 'English Auction'
  const isDutch = strategyName === 'Dutch Auction'
  const isSealed = strategyName === 'Sealed Bid Auction'
  const isStrategySet = listing.strategy && listing.strategy !== '0x0000000000000000000000000000000000000000'

  // Handle success states
  const isLoading = englishPending || dutchPending || sealedPending
  const isSuccessful = englishSuccess || dutchSuccess || sealedSuccess
  const successHash = englishSuccess ? englishHash : dutchSuccess ? dutchHash : sealedSuccess ? sealedHash : undefined

  // Show success dialog when transaction is successful
  if (isSuccessful && !isLoading && !showSuccessDialog) {
    setShowSuccessDialog(true)
    setSuccessBidAmount(bidAmount || depositAmount)
    setSuccessBidType(isDutch ? 'purchase' : isSealed ? 'commit' : 'bid')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isStrategySet) {
      setError('Strategy not set yet. Cannot place bid.')
      return
    }

    try {
      const listingId = BigInt(listing.id)

      if (isEnglish) {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError('Please enter a valid bid amount')
          return
        }
        await placeBidEnglish(listingId, bidAmount)
        
      } else if (isDutch) {
        // For Dutch auction, we need current price
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError('Please enter current price amount')
          return
        }
        await purchaseDutchAuction(listingId, bidAmount)
        
      } else if (isSealed) {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError('Please enter a valid bid amount')
          return
        }
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
          setError('Please enter a valid deposit amount')
          return
        }
        await commitBid(listingId, bidAmount, depositAmount)
      }
    } catch (error: any) {
      const formattedError = formatTransactionError(error)
      setError(formattedError)
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
                    onChange={(e) => setBidAmount(e.target.value)}
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
                    onChange={(e) => setBidAmount(e.target.value)}
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
                      onChange={(e) => setBidAmount(e.target.value)}
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
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !bidAmount || (isSealed && !depositAmount)}
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : isDutch ? 'Purchase Now' : isSealed ? 'Commit Bid' : 'Place Bid'}
                </Button>
              </div>
            </form>
          )}

          {isSuccessful && !showSuccessDialog && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded text-center">
              ✅ {isDutch ? 'Purchase' : isSealed ? 'Commitment' : 'Bid'} successful! 
            </div>
          )}
        </div>
      </DialogContent>

      {/* Success Dialog */}
      <BidSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false)
          onClose()
          setBidAmount('')
          setDepositAmount('')
          setError('')
        }}
        listing={listing}
        transactionHash={successHash}
        bidAmount={successBidAmount}
        bidType={successBidType}
      />
    </Dialog>
  )
}