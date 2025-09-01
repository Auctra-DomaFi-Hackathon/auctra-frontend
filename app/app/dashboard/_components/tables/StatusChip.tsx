'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AuctionState } from '../hooks/useDashboardData'

export default function StatusChip({ state }: { state: AuctionState }) {
  const tone =
    state === 'LIVE'
      ? 'text-green-700 bg-green-50 border-green-200'
      : state === 'SCHEDULED'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-gray-700 bg-gray-50 border-gray-200'
  return <Badge variant="outline" className={cn('px-2', tone)}>{state}</Badge>
}
