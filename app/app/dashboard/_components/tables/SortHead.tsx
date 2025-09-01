'use client'

import { TableHead } from '@/components/ui/table'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortDir } from '../hooks/useSort'

export default function SortHead({
  children, active, dir, onClick, className,
}: {
  children: React.ReactNode
  active?: boolean
  dir?: SortDir
  onClick?: () => void
  className?: string
}) {
  return (
    <TableHead className={cn('whitespace-nowrap', className)} onClick={onClick}>
      <button className="inline-flex items-center gap-1 hover:text-blue-700">
        <span>{children}</span>
        {active ? (dir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />) : null}
      </button>
    </TableHead>
  )
}
