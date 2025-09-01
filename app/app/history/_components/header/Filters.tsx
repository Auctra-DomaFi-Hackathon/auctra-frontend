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
          className="bg-white h-10 sm:h-11"
        />
      </div>

      {/* Tabs: horizontal scroll di mobile, wrap di ≥sm */}
      <Tabs value={active} onValueChange={(v) => setActive(v as EventKind | 'All')} className="w-full">
        <TabsList
          className="
            w-full bg-blue-50/40
            overflow-x-auto sm:overflow-visible
            whitespace-nowrap sm:whitespace-normal
            no-scrollbar
            flex sm:flex-wrap gap-1.5 sm:gap-2
            px-1.5 py-1.5
          "
        >
          <TabsTrigger
            value="All"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 text-xs sm:text-sm px-3 py-1.5"
          >
            All
          </TabsTrigger>
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f}
              value={f}
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 text-xs sm:text-sm px-3 py-1.5"
            >
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
