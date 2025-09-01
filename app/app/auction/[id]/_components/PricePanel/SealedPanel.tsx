'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SealedPanel({
  phase,
  bidsCount,
  bidAmount,
  setBidAmount,
  onCommitBid,
  onRevealBid,
}: {
  phase: 'scheduled' | 'commit' | 'reveal' | 'closed' | null
  bidsCount: number
  bidAmount: string
  setBidAmount: (v: string) => void
  onCommitBid: () => Promise<void> | void
  onRevealBid: () => Promise<void> | void
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Sealed Bid Auction</h2>

          <div className="flex justify-center space-x-2 mb-6">
            <Badge className={phase === 'commit' ? 'bg-blue-600' : 'bg-gray-400'}>Commit Phase</Badge>
            <Badge className={phase === 'reveal' ? 'bg-green-600' : 'bg-gray-400'}>Reveal Phase</Badge>
            <Badge className={phase === 'closed' ? 'bg-red-600' : 'bg-gray-400'}>Closed</Badge>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-2xl font-bold mb-2">{bidsCount}</div>
            <p className="text-gray-600">Committed Bids</p>
          </div>

          {phase === 'commit' && (
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <Button size="lg" className="w-full" onClick={onCommitBid}>
                Commit Bid
              </Button>
            </div>
          )}

          {phase === 'reveal' && (
            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={onRevealBid}>
              Reveal Bid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
