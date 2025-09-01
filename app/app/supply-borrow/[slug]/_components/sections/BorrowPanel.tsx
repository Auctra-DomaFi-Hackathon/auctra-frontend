'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Wallet, AlertTriangle } from 'lucide-react'

export default function BorrowPanel({ position, metrics, onBorrow, borrowAmount, setBorrowAmount }: any) {
  const { fmtUSD, fmtPct, availableToBorrow } = metrics
  const newDebt = position.debtUSD + (borrowAmount || 0)
  const newLtv = (newDebt / position.collateralUSD) * 100
  const newHF = (position.lth/100) / (newDebt / position.collateralUSD)

  return (
    <Card className="border-gray-200">
      <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-blue-600" /> Borrow {position.loanToken}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Borrow Amount (USD)</Label>
          <Input type="number" min={0} max={availableToBorrow} value={borrowAmount} onChange={(e)=>setBorrowAmount(Number(e.target.value))} placeholder="e.g. 500" />
          <p className="text-xs text-gray-500">Available to borrow: {fmtUSD(availableToBorrow)} at {fmtPct(position.borrowAPR)} APR</p>
        </div>

        <div className="flex gap-2">
          {[0.25, 0.5, 0.75, 1].map((pct)=>(
            <Button key={pct} variant="outline" size="sm" onClick={()=>setBorrowAmount(Math.round(availableToBorrow * pct))}>
              {Math.round(pct*100)}%
            </Button>
          ))}
        </div>

        {borrowAmount > 0 && (
          <div className="rounded-xl border p-4 bg-amber-50/30 text-sm text-gray-700 space-y-1">
            <div>New Debt: <span className="font-medium">{fmtUSD(newDebt)}</span></div>
            <div>New LTV: <span className="font-medium">{fmtPct(newLtv)}</span></div>
            <div>New Health Factor: <span className="font-medium">{newHF.toFixed(2)}</span></div>
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
              <AlertTriangle className="h-3 w-3" /> Interest accrues at {fmtPct(position.borrowAPR)} APR
            </div>
          </div>
        )}

        <Button onClick={onBorrow} disabled={(borrowAmount||0) <= 0 || (borrowAmount||0) > availableToBorrow} className="w-full">
          Borrow {position.loanToken}
        </Button>
      </CardContent>
    </Card>
  )
}
