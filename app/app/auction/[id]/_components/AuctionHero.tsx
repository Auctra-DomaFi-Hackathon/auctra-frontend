'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import { Countdown } from '@/features/auction/Countdown'
import type { Domain, Auction } from '@/types'

export default function AuctionHero({
  domain,
  watchers,
  auctionStatus,
  endTime,
}: {
  domain: Domain
  watchers: number
  auctionStatus: { isActive: boolean }
  endTime: Auction['endTime']
}) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">{domain.name}</h1>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Badge className="bg-green-100 text-green-800">Verified</Badge>
            <Badge variant="outline">.{domain.tld}</Badge>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{watchers} watching</span>
            </div>
          </div>

          {auctionStatus.isActive && (
            <div className="flex justify-center mb-6">
              <Countdown endTime={endTime} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
