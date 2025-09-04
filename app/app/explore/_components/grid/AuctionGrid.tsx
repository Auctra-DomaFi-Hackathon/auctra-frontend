'use client'

import { AuctionCard } from '@/features/auction/AuctionCard'
import { ExplorePagination } from '../ExplorePagination'
import type { Auction, Domain } from '@/types'

export default function AuctionGrid({
  auctions,
  domainById,
  emptyLabel,
  currentPage,
  totalPages,
  onPageChange,
}: {
  auctions: Auction[]
  domainById: Map<string, Domain>
  emptyLabel: string
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}) {
  if (!auctions.length) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {auctions.map((a) => {
          const d = domainById.get(a.domainId)
          if (!d) return null
          return <AuctionCard key={a.id} auction={a} domain={d} />
        })}
      </div>
      
      {/* Pagination */}
      {totalPages && totalPages > 1 && currentPage && onPageChange && (
        <ExplorePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-8"
        />
      )}
    </>
  )
}
