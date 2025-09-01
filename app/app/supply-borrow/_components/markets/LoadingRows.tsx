'use client'
import { TableRow, TableCell } from '@/components/ui/table'
export default function LoadingRows({ cols=6, rows=3 }: { cols?:number; rows?:number }) {
  return <>
    {Array.from({length:rows}).map((_,i)=>(
      <TableRow key={i}><TableCell colSpan={cols}><div className="h-10 w-full animate-pulse rounded-xl bg-blue-100/40" /></TableCell></TableRow>
    ))}
  </>
}
