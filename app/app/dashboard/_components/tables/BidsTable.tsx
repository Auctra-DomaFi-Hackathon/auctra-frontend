'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
// import { Coins } from 'lucide-react'

import SortHead from './SortHead'
import SkeletonRows from './SkeletonRows'
import EmptyRow from './EmptyRow'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSort } from '../hooks/useSort'
import type { BidRow } from '../hooks/useDashboardData'
import { PushPin } from '@phosphor-icons/react/dist/icons/PushPin'

export default function BidsTable({ rows }: { rows: BidRow[] }) {
  const bSort = useSort(rows)

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {/* <Coins className="h-5 w-5 text-blue-600" /> */}
          <PushPin className="h-5 w-5 text-blue-600" />
          My Bids
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50/40">
              <TableRow>
                <SortHead onClick={() => bSort.toggle('domain')} active={bSort.key==='domain'} dir={bSort.dir}>Domain</SortHead>
                <SortHead onClick={() => bSort.toggle('type')} active={bSort.key==='type'} dir={bSort.dir}>Type</SortHead>
                <th className="px-4 py-2 whitespace-nowrap">Your Bid</th>
                <th className="px-4 py-2 whitespace-nowrap">Phase/Rank</th>
                <SortHead onClick={() => bSort.toggle('result')} active={bSort.key==='result'} dir={bSort.dir}>Result</SortHead>
                <th className="px-4 py-2">Tx</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows === undefined ? (
                <SkeletonRows cols={6} message="Loading bid data..." />
              ) : bSort.sorted.length === 0 ? (
                <EmptyRow message="You haven't placed any bids" colSpan={6} />
              ) : (
                bSort.sorted.map((r) => (
                  <TableRow key={r.id} className="hover:bg-blue-50/30 transition">
                    <TableCell className="font-medium">{r.domain}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.yourBid}</TableCell>
                    <TableCell>{r.phaseOrRank}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          r.result === 'Won' && 'text-blue-700 border-blue-200 bg-blue-50',
                          r.result === 'Lost' && 'text-red-700 border-red-200 bg-red-50',
                          r.result === 'Pending' && 'text-gray-700'
                        )}
                      >
                        {r.result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.txHash ? (
                        <a
                          className="text-blue-700 hover:underline"
                          href={`https://sepolia.etherscan.io/tx/${r.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
