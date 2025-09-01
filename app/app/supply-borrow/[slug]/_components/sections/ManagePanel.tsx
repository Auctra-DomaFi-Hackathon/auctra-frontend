'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ManagePanel({ position, metrics, onRepay, repayAmount, setRepayAmount, onWithdraw }: any) {
  const { fmtUSD } = metrics
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-gray-200">
        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Repay Debt</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Repay Amount (USD)</Label>
            <Input type="number" min={0} max={position.debtUSD} value={repayAmount} onChange={(e)=>setRepayAmount(Number(e.target.value))} placeholder="e.g. 200" />
            <p className="text-xs text-gray-500">Outstanding debt: {fmtUSD(position.debtUSD)}</p>
          </div>
          <div className="flex gap-2">
            {[0.25,0.5,0.75,1].map((pct)=>(
              <Button key={pct} variant="outline" size="sm" onClick={()=>setRepayAmount(Math.round(position.debtUSD*pct))}>
                {Math.round(pct*100)}%
              </Button>
            ))}
          </div>
          <Button onClick={onRepay} disabled={(repayAmount||0) <= 0} className="w-full">Repay {position.loanToken}</Button>
        </CardContent>
      </Card>

      <Card className={cn('border-gray-200', position.debtUSD>0 && 'opacity-70')}>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /> Withdraw Collateral</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {position.debtUSD > 0 ? (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <div className="font-medium text-gray-900 mb-2">Debt Outstanding</div>
              <div className="text-sm text-gray-600 mb-4">
                You must fully repay your debt of {fmtUSD(position.debtUSD)} before withdrawing collateral.
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <div className="font-medium text-gray-900 mb-2">Ready to Withdraw</div>
              <div className="text-sm text-gray-600 mb-4">Your position is debt-free. You can safely withdraw your collateral.</div>
              <Button onClick={onWithdraw} variant="secondary" className="w-full">Withdraw {position.domain.label}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
