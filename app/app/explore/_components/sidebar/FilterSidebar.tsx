'use client'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search } from 'lucide-react'

export default function FilterSidebar({
  searchQuery, setSearchQuery,
  tlds, selectedTLDs, toggleTLD,
  auctionTypes, selectedTypes, toggleType,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  sortBy, setSortBy,
}: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  tlds: string[]
  selectedTLDs: string[]
  toggleTLD: (tld: string, checked: boolean) => void
  auctionTypes: readonly string[]
  selectedTypes: string[]
  toggleType: (type: string, checked: boolean) => void
  priceMin: string
  setPriceMin: (v: string) => void
  priceMax: string
  setPriceMax: (v: string) => void
  sortBy: 'ending-soon' | 'newest' | 'price-low' | 'price-high'
  setSortBy: (v: any) => void
}) {
  return (
    <>
      <div>
        <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-900 dark:text-white">Search Domains</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search domains"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:ring-blue-600 dark:focus:ring-blue-400"
            aria-label="Search domains"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-gray-900 dark:text-white">TLD</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {tlds.map((tld) => (
            <label key={tld} htmlFor={`tld-${tld}`} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id={`tld-${tld}`}
                checked={selectedTLDs.includes(tld)}
                onCheckedChange={(c) => toggleTLD(tld, !!c)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{tld}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Auction Type</h4>
        <div className="space-y-2">
          {auctionTypes.map((type) => (
            <label key={type} htmlFor={`type-${type}`} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type.toLowerCase())}
                onCheckedChange={(c) => toggleType(type, !!c)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Price Range</h4>
        <div className="space-y-3">
          <Input
            placeholder="Min price"
            inputMode="numeric"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-label="Minimum price"
          />
          <Input
            placeholder="Max price"
            inputMode="numeric"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Sort</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
          aria-label="Sort auctions"
        >
          <option value="ending-soon">Ending Soon</option>
          <option value="newest">Newest</option>
          <option value="price-low">Lowest Price</option>
          <option value="price-high">Highest Price</option>
        </select>
      </div>
    </>
  )
}
