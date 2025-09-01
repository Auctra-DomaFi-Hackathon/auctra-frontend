'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { BadgeCheck, Banknote, BarChart3, TrendingUp, Wallet, ShieldCheck, Info } from 'lucide-react'
import { StatCard } from './Stats'
import type { Market, Position, DomainItem } from '../hooks/types'

const fmtUSD = (n:number)=> n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0})
const fmtPct = (n:number)=> `${n.toFixed(1)}%`

export default function MarketDrawer({
  open, onOpenChange, selected,
  positions, setPositions,
  supplyState, setSupplyState, handleSupply,
  MOCK_DOMAINS, MOCK_MARKETS,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  selected: Market | null
  positions: Position[]
  setPositions: (fn: (prev: Position[]) => Position[]) => void
  supplyState: { selectedDomainId?: string; supplyMarketId?: string; supplyValue: number }
  setSupplyState: (s: any) => void
  handleSupply: () => void
  MOCK_DOMAINS: DomainItem[]
  MOCK_MARKETS: Market[]
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        {selected && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
                {selected.name}
              </SheetTitle>
              <SheetDescription>
                Collateral Pool <b>{selected.ticker}</b> · Asset {selected.loanToken} · {selected.chain}
              </SheetDescription>
            </SheetHeader>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <StatCard title="Total Supplied" value={fmtUSD(selected.totalSupplied)} icon={<Banknote className="h-4 w-4 text-blue-600" />} />
              <StatCard title="Avg Utilization" value={fmtPct(selected.utilization)} icon={<BarChart3 className="h-4 w-4 text-blue-600" />} />
              <StatCard title="Lend APR" value={fmtPct(selected.lendAPR)} icon={<TrendingUp className="h-4 w-4 text-blue-600" />} />
              <StatCard title="Borrow APR" value={fmtPct(selected.borrowAPR)} icon={<Wallet className="h-4 w-4 text-blue-600" />} />
            </div>

            {/* Positions */}
            <Card className="border-gray-200 mb-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Your Positions
                  <Badge variant="secondary">
                    {positions.filter((p) => p.marketId === selected.id).length} active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {positions.filter(p=>p.marketId===selected.id).length===0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center">
                    <div className="text-gray-900 font-medium">No positions found</div>
                    <div className="text-gray-600 text-sm mt-1">Supply a domain as collateral to open a position.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {positions.filter(p=>p.marketId===selected.id).map((p)=>(
                      <div key={p.id} className="flex items-center justify-between rounded-xl border p-3 hover:bg-blue-50/40 transition">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {p.domain.label}
                            {p.domain.verified ? (
                              <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5 text-blue-600" />Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1"><Info className="h-3.5 w-3.5" />Unverified</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Collateral {fmtUSD(p.collateralUSD)} · Debt {fmtUSD(p.debtUSD)} · LTV {p.ltv}% · LTH {p.lth}% · Status {p.status}
                          </div>
                        </div>
                        {/* manage button: keep link outside to keep drawer simple */}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supply */}
            <Card className="border-gray-200">
              <CardHeader><CardTitle className="text-base">Supply Collateral</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Select Domain</label>
                  <Select value={supplyState.selectedDomainId} onValueChange={(v)=>setSupplyState((s:any)=>({...s,selectedDomainId:v}))}>
                    <SelectTrigger><SelectValue placeholder="Choose a domain" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_DOMAINS.map((d)=>(
                        <SelectItem key={d.id} value={d.id}>{d.label} {d.verified ? '• Verified' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Pool Collateral</label>
                  <Select value={supplyState.supplyMarketId ?? selected.id} onValueChange={(v)=>setSupplyState((s:any)=>({...s,supplyMarketId:v}))}>
                    <SelectTrigger><SelectValue placeholder="Choose a pool" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_MARKETS.map((m)=>(
                        <SelectItem key={m.id} value={m.id}>{m.name} ({m.ticker})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Collateral Value (USD)</label>
                  <Input type="number" min={0} value={supplyState.supplyValue} onChange={(e)=>setSupplyState((s:any)=>({...s,supplyValue:Number(e.target.value)}))} placeholder="e.g. 2500" />
                  <p className="text-xs text-gray-500">Transaction simulated for demo. Collateral stays locked until repaid.</p>
                </div>

                <Button className="w-full" onClick={handleSupply} disabled={!supplyState.selectedDomainId || (supplyState.supplyValue||0) <= 0}>
                  Supply
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
