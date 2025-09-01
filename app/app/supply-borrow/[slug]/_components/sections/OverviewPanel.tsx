'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Coins, Banknote, ShieldCheck, TrendingUp, Wallet } from 'lucide-react'
import StatCard from '../cards/StatCard'
import DetailRow from '../cards/DetailRow'
import EarningsChart from '../charts/EarningsChart'

export default function OverviewPanel({ position, metrics }: any) {
  const { fmtUSD, fmtPct, currentLTV } = metrics

  const totalEarnings = position.collateralUSD * (position.lendAPR / 100) * (8 / 12)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" /> Position Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Collateral Asset" value={position.domain.label} />
            <DetailRow label="Market Pool" value={`${position.marketName} (${position.marketTicker})`} />
            <DetailRow label="Loan Token" value={position.loanToken} />
            <DetailRow label="Current LTV" value={fmtPct(currentLTV * 100)} />
            <DetailRow label="Max LTV" value={fmtPct(position.ltv)} />
            <DetailRow label="Liquidation Threshold" value={fmtPct(position.lth)} />
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader><CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-blue-600" /> Market Rates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Supply APR" value={fmtPct(position.lendAPR)} />
            <DetailRow label="Borrow APR" value={fmtPct(position.borrowAPR)} />
            <DetailRow label="Net APR" value={fmtPct(position.lendAPR - position.borrowAPR)} />
            <DetailRow label="Chain" value={position.chain} />
            <DetailRow label="Status" value={position.status} />
            <div className="pt-4 border-t text-sm text-gray-600">Rates update every block</div>
          </CardContent>
        </Card>
      </div>

      <EarningsChart 
        domainName={position.domain.label}
        totalEarnings={totalEarnings}
      />
    </div>
  )
}
