'use client'

import { TableRow, TableCell } from '@/components/ui/table'

export default function EmptyRow({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-10 text-gray-500">
        {message}
      </TableCell>
    </TableRow>
  )
}
