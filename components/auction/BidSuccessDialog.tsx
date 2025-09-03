'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, CheckCircle, Copy } from 'lucide-react'
import { useState } from 'react'
import type { Listing, NFTMetadata } from '@/lib/graphql/types'

interface BidSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  listing: (Listing & { metadata?: NFTMetadata }) | null
  transactionHash: string | undefined
  bidAmount: string
  bidType: 'bid' | 'purchase' | 'commit'
}

export default function BidSuccessDialog({ 
  isOpen, 
  onClose, 
  listing, 
  transactionHash, 
  bidAmount,
  bidType 
}: BidSuccessDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!listing || !transactionHash) return null

  const copyTransactionHash = async () => {
    try {
      await navigator.clipboard.writeText(transactionHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy transaction hash:', error)
    }
  }

  const openBlockExplorer = () => {
    // Doma Testnet explorer
    const explorerUrl = `https://explorer-testnet.doma.xyz/tx/${transactionHash}`
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

  const getBidTypeText = () => {
    switch (bidType) {
      case 'purchase':
        return 'Purchase Successful!'
      case 'commit':
        return 'Bid Committed!'
      default:
        return 'Bid Placed Successfully!'
    }
  }

  const getBidTypeDescription = () => {
    switch (bidType) {
      case 'purchase':
        return 'You have successfully purchased this domain at the current Dutch auction price.'
      case 'commit':
        return 'Your sealed bid has been committed. Remember to reveal it during the reveal phase.'
      default:
        return 'Your bid has been placed successfully. You will be notified if you are outbid.'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {getBidTypeText()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Domain Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {listing.metadata?.name || `Token #${listing.tokenId.slice(-8)}`}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {listing.metadata?.tld || '.eth'}
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{bidAmount} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Listing ID:</span>
              <span className="font-medium">#{listing.id}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center">
            {getBidTypeDescription()}
          </p>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Transaction Hash:</label>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <code className="text-xs text-gray-800 flex-1 break-all">
                {transactionHash}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyTransactionHash}
                className="h-8 w-8 p-0"
                disabled={copied}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={openBlockExplorer}
              className="flex-1 flex items-center gap-2"
            >
              View on Explorer
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>

          {/* Success Badge */}
          <div className="text-center">
            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
              ✅ Transaction Confirmed
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}