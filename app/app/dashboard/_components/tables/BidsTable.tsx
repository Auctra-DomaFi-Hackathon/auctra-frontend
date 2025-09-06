'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import SortHead from './SortHead'
import SkeletonRows from './SkeletonRows'
import EmptyRow from './EmptyRow'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSort } from '../hooks/useSort'
import type { BidRow } from '../hooks/useDashboardData'
import { PushPin } from '@phosphor-icons/react/dist/icons/PushPin'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function BidsTable({ rows }: { rows: BidRow[] }) {
  const bSort = useSort(rows)

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          {/* <Coins className="h-5 w-5 text-blue-600" /> */}
          <PushPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          My Bids
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50/40 dark:bg-gray-700/50">
              <TableRow className="border-gray-200 dark:border-gray-600">
                <SortHead onClick={() => bSort.toggle('domain')} active={bSort.key==='domain'} dir={bSort.dir}>Domain</SortHead>
                <th className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 text-left">TLD</th>
                <SortHead onClick={() => bSort.toggle('type')} active={bSort.key==='type'} dir={bSort.dir}>Type</SortHead>
                <th className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 text-left">Your Bid</th>
                <th className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 text-left">Phase/Rank</th>
                <SortHead onClick={() => bSort.toggle('result')} active={bSort.key==='result'} dir={bSort.dir}>Result</SortHead>
                <th className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 text-left">Transaction Hash</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows === undefined ? (
                <SkeletonRows cols={7} message="Loading bid data..." />
              ) : bSort.sorted.length === 0 ? (
                <EmptyRow message="You haven't placed any bids" colSpan={7} />
              ) : (
                bSort.sorted.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition border-gray-200 dark:border-gray-700">
                    <TableCell className="font-medium text-gray-900 dark:text-white">{r.domain}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {r.tld || '.doma'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{r.type} Auction</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{r.yourBid}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{r.phaseOrRank}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          r.result === 'Won' && 'text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30',
                          r.result === 'Lost' && 'text-red-700 dark:text-red-300 border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900/30',
                          r.result === 'Pending' && 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                        )}
                      >
                        {r.result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.txHash ? (
                        <Link
                          className="gap-1 mr-2 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline text-sm font-medium"
                          href={`https://explorer-testnet.doma.xyz/tx/${r.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View Transaction Hash 
                        </Link>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
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
