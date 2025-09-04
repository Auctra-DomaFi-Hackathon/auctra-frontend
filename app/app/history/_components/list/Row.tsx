'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getIcon, getTone, timeShort } from '../utils/icons'
import type { ActivityItem } from '../utils/types'

export default function Row({ item }: { item: ActivityItem }) {
  const Icon = getIcon(item.kind, item.title)
  const tone = getTone(item.kind, item.title)

  return (
    <div
      className="
        flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
        p-3 sm:p-4 shadow-sm hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition
      "
    >
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border',
          tone.bg, tone.border
        )}
        aria-hidden
      >
        <Icon className={cn('h-4 w-4', tone.icon)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="font-medium text-gray-900 dark:text-white truncate">{item.title}</div>

          {item.amount && (
            <Badge
              variant="secondary"
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[11px] sm:text-xs"
            >
              {item.amount}
            </Badge>
          )}

          {item.domain && (
            <Badge variant="outline" className="gap-1 text-[11px] sm:text-xs dark:border-gray-600 dark:text-gray-300">
              <GlobeMini /> {item.domain}
            </Badge>
          )}

          <Badge variant="outline" className="text-[11px] sm:text-xs dark:border-gray-600 dark:text-gray-300">{item.kind}</Badge>
        </div>

        {item.subtitle && (
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">{item.subtitle}</div>
        )}

        <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {timeShort(item.time)}
          {item.txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="ml-3 inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:underline"
            >
              View tx <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function GlobeMini() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="5" ry="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
