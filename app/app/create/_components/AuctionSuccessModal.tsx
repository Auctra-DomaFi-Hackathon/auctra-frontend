'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, ExternalLink, Copy } from 'lucide-react'
import { useState } from 'react'

interface AuctionSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  domain: string
  auctionType: string
  reservePrice: number
  transactionHashes: {
    list?: string
    criteria?: string
    strategy?: string
    goLive?: string
  }
}

export default function AuctionSuccessModal({
  isOpen,
  onClose,
  listingId,
  domain,
  auctionType,
  reservePrice,
  transactionHashes
}: AuctionSuccessModalProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  const copyToClipboard = (text: string, hashType: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(hashType)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const getExplorerUrl = (hash: string) => `https://explorer-testnet.doma.xyz/tx/${hash}`

  const transactionSteps = [
    { key: 'list', label: 'List Domain', hash: transactionHashes.list },
    { key: 'criteria', label: 'Set Criteria', hash: transactionHashes.criteria },
    { key: 'strategy', label: 'Choose Strategy', hash: transactionHashes.strategy },
    { key: 'goLive', label: 'Go Live', hash: transactionHashes.goLive },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-6 w-6" />
            🎉 Auction Created Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Auction Details */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3">Auction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Listing ID:</span>
                <span className="font-mono bg-green-100 dark:bg-green-900/40 text-gray-900 dark:text-gray-100 px-2 py-1 rounded">{listingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Domain:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <span className="capitalize text-gray-900 dark:text-white">{auctionType} Auction</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Reserve Price:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{reservePrice} ETH</span>
              </div>
            </div>
          </div>

          {/* Transaction Hashes */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Transaction Details</h3>
            <div className="space-y-3">
              {transactionSteps.map((step) => (
                <div key={step.key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{step.label}</span>
                  </div>
                  
                  {step.hash && (
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded font-mono">
                        {step.hash.slice(0, 6)}...{step.hash.slice(-6)}
                      </code>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(step.hash!, step.key)}
                        className="h-8 w-8 p-0"
                        title="Copy transaction hash"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                        title="View on Explorer"
                      >
                        <a
                          href={getExplorerUrl(step.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {copiedHash && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 text-center">
                ✓ {transactionSteps.find(s => s.key === copiedHash)?.label} hash copied to clipboard!
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your auction is now live on the Doma Testnet blockchain! 
              Bidders can now participate in your {auctionType} auction.
            </p>
            
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white">
              Create Another Auction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}