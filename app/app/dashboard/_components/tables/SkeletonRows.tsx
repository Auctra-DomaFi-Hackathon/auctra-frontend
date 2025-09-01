'use client'

import { TableRow, TableCell } from '@/components/ui/table'

export default function SkeletonRows({ cols = 5, rows = 3 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`sk-${i}`}>
          <TableCell colSpan={cols}>
            <div className="h-10 w-full animate-pulse rounded-xl bg-blue-100/40" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
