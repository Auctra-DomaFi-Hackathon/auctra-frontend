'use client'

import type { Auction } from '@/types'

export function useSealedPhase(auction: Auction | null) {
  if (!auction || auction.type !== 'sealed' || !auction.revealStart || !auction.revealEnd) return null
  const now = Date.now()
  const start = new Date(auction.startTime).getTime()
  const commitEnd = new Date(auction.revealStart).getTime()
  const revealEnd = new Date(auction.revealEnd).getTime()

  if (now < start) return 'scheduled'
  if (now < commitEnd) return 'commit'
  if (now < revealEnd) return 'reveal'
  return 'closed'
}
