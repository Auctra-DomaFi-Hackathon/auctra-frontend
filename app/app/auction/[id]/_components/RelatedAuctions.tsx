'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AuctionCard } from '@/features/auction/AuctionCard'
import type { Auction, Domain } from '@/types'

export default function RelatedAuctions({
  relatedAuctions,
  allDomains,
}: {
  relatedAuctions: Auction[]
  allDomains: Domain[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Auctions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedAuctions.map((a) => {
            const d = allDomains.find(x => x.id === a.domainId)
            if (!d) return null
            return <AuctionCard key={a.id} auction={a} domain={d} />
          })}
        </div>
      </CardContent>
    </Card>
  )
}
