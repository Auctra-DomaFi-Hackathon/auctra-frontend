'use client'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Eye, Clock, Filter } from 'lucide-react'

export default function StatusTabs({
  tab,
  setTab,
  counts,
}: {
  tab: 'expiring' | 'ongoing' | 'liquidation'
  setTab: (v: any) => void
  counts: { expiring: number; ongoing: number; liquidation: number }
}) {
  return (
    <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-50/50">
      <TabsTrigger value="expiring" className="flex items-center gap-2 text-xs sm:text-sm">
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline">Expiring</span>
        <span className="sm:hidden">Exp</span>
        <Badge variant="destructive" className="ml-1 text-xs">{counts.expiring}</Badge>
      </TabsTrigger>
      <TabsTrigger value="ongoing" className="flex items-center gap-2 text-xs sm:text-sm">
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">Ongoing</span>
        <span className="sm:hidden">Live</span>
        <Badge className="ml-1 text-xs">{counts.ongoing}</Badge>
      </TabsTrigger>
      <TabsTrigger value="liquidation" className="flex items-center gap-2 text-xs sm:text-sm">
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Liquidation</span>
        <span className="sm:hidden">Liq</span>
        <Badge variant="outline" className="ml-1 text-xs">{counts.liquidation}</Badge>
      </TabsTrigger>
    </TabsList>
  )
}
