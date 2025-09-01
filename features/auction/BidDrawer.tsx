'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, generateRandomSalt, createCommitHash, getCurrentDutchPrice } from '@/lib/utils/index'
import { useBidsStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import type { Auction, Domain } from '@/types'

interface BidDrawerProps {
  auction: Auction
  domain: Domain
  trigger: React.ReactNode
}

export function BidDrawer({ auction, domain, trigger }: BidDrawerProps) {
  const [open, setOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const { addPendingBid } = useBidsStore()
  const { toast } = useToast()

  const isDutch = auction.type === 'dutch'
  const currentPrice = isDutch ? getCurrentDutchPrice(auction) : 0
  const minBid = isDutch 
    ? currentPrice 
    : auction.parameters.sealed?.minDepositUsd || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amount = parseFloat(bidAmount)
      
      if (amount < minBid) {
        throw new Error(`Bid must be at least ${formatCurrency(minBid)}`)
      }

      if (isDutch) {
        addPendingBid({
          auctionId: auction.id,
          amount,
          type: 'dutch'
        })
        
        toast({
          title: "Bid Submitted",
          description: `Your bid of ${formatCurrency(amount)} for ${domain.name} has been submitted.`,
        })
      } else {
        const salt = generateRandomSalt()
        const commitHash = createCommitHash(amount, salt, '0xb1ma...dev') // Mock address
        
        addPendingBid({
          auctionId: auction.id,
          amount,
          salt,
          commitHash,
          type: 'sealed'
        })
        
        toast({
          title: "Commit Submitted",
          description: `Your sealed bid for ${domain.name} has been committed. Remember to reveal during the reveal phase!`,
        })
      }

      setOpen(false)
      setBidAmount('')
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isDutch ? 'Buy Now' : 'Submit Sealed Bid'}
          </DialogTitle>
          <DialogDescription>
            {isDutch 
              ? `Purchase ${domain.name} at the current Dutch auction price.`
              : `Submit a sealed bid for ${domain.name}. You'll need to reveal your bid later.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/50 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Domain</div>
              <div className="font-semibold">{domain.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {isDutch ? 'Current Price' : 'Min Deposit'}
              </div>
              <div className="font-semibold">{formatCurrency(minBid)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bidAmount">
              {isDutch ? 'Purchase Amount' : 'Bid Amount'}
            </Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.01"
              min={minBid}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Minimum: ${formatCurrency(minBid)}`}
              required
              className="focus-ring"
            />
          </div>

          {!isDutch && (
            <div className="p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">Sealed Bid</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your bid will be hashed and committed. You must reveal it during the reveal phase or forfeit your deposit.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 focus-ring"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !bidAmount}
              className="flex-1 focus-ring"
            >
              {loading ? 'Submitting...' : isDutch ? 'Buy Now' : 'Submit Bid'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}