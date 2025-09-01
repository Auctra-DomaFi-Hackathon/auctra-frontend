'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'

export default function SupplyPanel({ position, metrics, onSupply, supplyAmount, setSupplyAmount }: any) {
  const { fmtUSD, fmtPct } = metrics
  const newCol = position.collateralUSD + (supplyAmount || 0)
  const newHF = (position.lth / 100) / (position.debtUSD / newCol) || Infinity
  const newAvail = Math.max(0, newCol * (position.ltv / 100) - position.debtUSD)

  return (
    <Card className="border-gray-200">
      <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" /> Supply More Collateral</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Additional Collateral Amount (USD)</Label>
          <Input type="number" min={0} value={supplyAmount} onChange={(e)=>setSupplyAmount(Number(e.target.value))} placeholder="e.g. 1000" />
          <p className="text-xs text-gray-500">Adding collateral will improve your health factor and increase borrowing capacity.</p>
        </div>

        {supplyAmount > 0 && (
          <div className="rounded-xl border p-4 bg-blue-50/30 text-sm text-gray-700 space-y-1">
            <div>New Collateral Value: <span className="font-medium">{fmtUSD(newCol)}</span></div>
            <div>New Health Factor: <span className="font-medium">{newHF===Infinity?'∞':newHF.toFixed(2)}</span></div>
            <div>New Available to Borrow: <span className="font-medium">{fmtUSD(newAvail)}</span></div>
          </div>
        )}

        <Button onClick={onSupply} disabled={(supplyAmount||0) <= 0} className="w-full">
          Supply Additional Collateral
        </Button>
      </CardContent>
    </Card>
  )
}
