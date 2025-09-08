'use client'

import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { EventKind } from '../utils/types'

const FILTERS: EventKind[] = [
  'Auctions','Bids','Wins/Losses','Supply & Borrow','Liquidations','Alerts', 'Renting',
]

export default function Filters({
  search, setSearch, active, setActive,
}: {
  search: string; setSearch: (v: string) => void
  active: EventKind | 'All'; setActive: (v: EventKind | 'All') => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search full-width di mobile */}
      <div className="w-full">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search domain, amount, note…"
          className="bg-white h-10 sm:h-11 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      {/* Tabs: horizontal scroll di mobile, wrap di ≥sm */}
      <Tabs value={active} onValueChange={(v) => setActive(v as EventKind | 'All')} className="w-full">
        <TabsList
          className="
            w-full bg-blue-50/40 dark:bg-gray-800/50
            overflow-x-auto sm:overflow-visible
            whitespace-nowrap sm:whitespace-normal
            no-scrollbar
            flex sm:flex-wrap gap-1.5 sm:gap-2
            px-1.5 py-1.5
          "
        >
          <TabsTrigger
            value="All"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 text-xs sm:text-sm px-3 py-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-300"
          >
            All
          </TabsTrigger>
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f}
              value={f}
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 text-xs sm:text-sm px-3 py-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-300"
            >
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
