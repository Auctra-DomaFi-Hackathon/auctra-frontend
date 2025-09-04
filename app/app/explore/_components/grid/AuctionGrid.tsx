'use client'

import { AuctionCard } from '@/features/auction/AuctionCard'
import type { Auction, Domain } from '@/types'

export default function AuctionGrid({
  auctions,
  domainById,
  emptyLabel,
}: {
  auctions: Auction[]
  domainById: Map<string, Domain>
  emptyLabel: string
}) {
  if (!auctions.length) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {auctions.map((a) => {
        const d = domainById.get(a.domainId)
        if (!d) return null
        return <AuctionCard key={a.id} auction={a} domain={d} />
      })}
    </div>
  )
}
