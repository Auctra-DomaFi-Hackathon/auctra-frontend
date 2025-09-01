'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Globe } from 'lucide-react'
import usdcLogo from "../../../../../public/images/LogoCoin/usd-coin-usdc-logo.png"
import Link from 'next/link'
import LoadingRows from './LoadingRows'
import EmptyRow from './EmptyRow'
import type { Market } from '../hooks/types'

const fmtUSD = (n:number)=> n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})
const fmtPct = (n:number)=> `${n.toFixed(1)}%`

export default function MarketsTable({
  rows, loading, onOpenMarket,
}: {
  rows: Market[]
  loading: boolean
  onOpenMarket: (m: Market) => void
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-blue-50/40">
          <TableRow>
            <TableHead>Collateral (Domain/TLD Pool)</TableHead>
            <TableHead>Loan Token</TableHead>
            <TableHead>Chain</TableHead>
            <TableHead className="text-right">Total Supplied</TableHead>
            <TableHead className="text-right">Earn APR</TableHead>
            <TableHead className="text-right">Borrow APR</TableHead>
            {/* <TableHead className="text-right">Utilization</TableHead> */}
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <LoadingRows cols={8} rows={3} />
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={8} message="No markets found" />
          ) : (
            rows.map((m) => (
              <TableRow key={m.id} className="hover:bg-blue-50/30 transition">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    {m.name} <Badge variant="outline">{m.ticker}</Badge>
                  </div>
                </TableCell>
                <TableCell><div className="flex items-center gap-2"><Image src={usdcLogo} alt="USDC Logo" width={16} height={16} className="h-4 w-4 text-blue-600" /> {m.loanToken}</div></TableCell>
                <TableCell>{m.chain}</TableCell>
                <TableCell className="text-right">{fmtUSD(m.totalSupplied)}</TableCell>
                <TableCell className="text-right text-blue-700">{fmtPct(m.lendAPR)}</TableCell>
                <TableCell className="text-right text-blue-700">{fmtPct(m.borrowAPR)}</TableCell>
                {/* <TableCell className="text-right">{fmtPct(m.utilization)}</TableCell> */}
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={()=>onOpenMarket(m)}>Quick View</Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/supply-borrow/${m.id}`}>View</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
