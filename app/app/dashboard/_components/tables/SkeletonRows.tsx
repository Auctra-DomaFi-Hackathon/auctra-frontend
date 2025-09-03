'use client'

import { TableRow, TableCell } from '@/components/ui/table'

export default function SkeletonRows({ 
  cols = 5, 
  rows = 3, 
  message 
}: { 
  cols?: number; 
  rows?: number; 
  message?: string;
}) {
  return (
    <>
      {message ? (
        <TableRow>
          <TableCell colSpan={cols} className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              {message}
            </div>
          </TableCell>
        </TableRow>
      ) : (
        Array.from({ length: rows }).map((_, i) => (
          <TableRow key={`sk-${i}`}>
            <TableCell colSpan={cols}>
              <div className="h-10 w-full animate-pulse rounded-xl bg-blue-100/40" />
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  )
}
