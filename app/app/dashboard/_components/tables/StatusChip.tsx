'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AuctionState } from '../hooks/useDashboardData'

export default function StatusChip({ state }: { state: AuctionState }) {
  const tone =
    state === 'LIVE'
      ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-600'
      : state === 'SCHEDULED'
      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-600'
      : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
  return <Badge variant="outline" className={cn('px-2', tone)}>{state}</Badge>
}
