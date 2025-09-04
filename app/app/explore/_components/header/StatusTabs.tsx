'use client'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Eye, Clock, Filter, List } from 'lucide-react'

export default function StatusTabs({
  tab,
  setTab,
  counts,
}: {
  tab: 'liquidation' | 'listings'
  setTab: (v: any) => void
  counts: { liquidation: number; listings: number }
}) {
  return (
    <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
      <TabsTrigger value="listings" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Auctions</span>
        <span className="sm:hidden">List</span>
        <Badge variant="secondary" className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{counts.listings}</Badge>
      </TabsTrigger>
      <TabsTrigger value="liquidation" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white">
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Liquidation</span>
        <span className="sm:hidden">Liq</span>
        <Badge variant="outline" className="ml-1 text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">{counts.liquidation}</Badge>
      </TabsTrigger>
    </TabsList>
  )
}
