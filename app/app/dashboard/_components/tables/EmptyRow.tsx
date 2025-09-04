'use client'

import { TableRow, TableCell } from '@/components/ui/table'

export default function EmptyRow({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <TableRow className="border-gray-200 dark:border-gray-700">
      <TableCell colSpan={colSpan} className="text-center py-10 text-gray-500 dark:text-gray-400">
        {message}
      </TableCell>
    </TableRow>
  )
}
