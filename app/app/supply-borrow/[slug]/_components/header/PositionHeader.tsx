'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Globe, ShieldCheck, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function PositionHeader({ position, metrics }: any) {
  const { healthFactor } = metrics
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/supply-borrow" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Markets
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-600" />
            {position.domain.label}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="gap-1">
              {position.domain.verified ? (<><ShieldCheck className="h-3.5 w-3.5 text-blue-600" />Verified Domain</>) : (<><Info className="h-3.5 w-3.5" />Unverified</>)}
            </Badge>
            <Badge variant="outline">{position.marketName}</Badge>
            <Badge variant="outline">{position.chain}</Badge>
            <Badge
              variant={position.status === 'Safe' ? 'default' : 'destructive'}
              className={position.status === 'Safe' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}
            >
              {position.status}
            </Badge>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">Health Factor</div>
          <div className={cn(
            'text-2xl font-bold',
            healthFactor > 1.5 ? 'text-blue-700' : healthFactor > 1.2 ? 'text-amber-600' : 'text-red-600'
          )}>
            {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
