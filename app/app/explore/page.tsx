'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import ExploreHeader from './_components/header/ExploreHeader'
import StatusTabs from './_components/header/StatusTabs'
import LoadingGrid from './_components/LoadingGrid'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useExploreData } from './_components/hooks/useExploreData'

// Lazy load heavy components
const FilterSidebar = dynamic(() => import('./_components/sidebar/FilterSidebar'), {
  loading: () => <div className="w-full lg:w-80 h-96 bg-gray-50 animate-pulse rounded-lg"></div>
})
const AuctionGrid = dynamic(() => import('./_components/grid/AuctionGrid'), {
  loading: () => <LoadingGrid count={4} />
})
const ListingGrid = dynamic(() => import('./_components/grid/ListingGrid'), {
  loading: () => <LoadingGrid count={4} />
})

export default function ExplorePage() {
  const {
    loading,
    tab, setTab,
    searchQuery, setSearchQuery,
    tlds, auctionTypes,
    selectedTLDs, toggleTLD,
    selectedTypes, toggleType,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    sortBy, setSortBy,
    byStatus, counts,
    domainById,
    listings,
    listingsError,
  } = useExploreData()

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <LoadingGrid count={8} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Filter Panel */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-6 order-2 lg:order-1">
          <Suspense fallback={<div className="w-full lg:w-80 h-96 bg-gray-50 animate-pulse rounded-lg"></div>}>
            <FilterSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              tlds={tlds}
              selectedTLDs={selectedTLDs}
              toggleTLD={toggleTLD}
              auctionTypes={auctionTypes}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </Suspense>
        </aside>

        {/* Right Grid */}
        <main className="flex-1 order-1 lg:order-2">
          <ExploreHeader />
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <StatusTabs tab={tab} setTab={setTab} counts={counts} />
            {(['expiring', 'ongoing', 'liquidation'] as const).map((s) => (
              <TabsContent key={s} value={s}>
                <Suspense fallback={<LoadingGrid count={4} />}>
                  <AuctionGrid
                    auctions={byStatus[s]}
                    domainById={domainById}
                    emptyLabel={`No ${s} auctions found matching your criteria.`}
                  />
                </Suspense>
              </TabsContent>
            ))}
            <TabsContent value="listings">
              <Suspense fallback={<LoadingGrid count={4} />}>
                {listingsError ? (
                  <div className="text-center py-12 bg-red-50 rounded-xl">
                    <p className="text-red-600">
                      Failed to load listings: {listingsError.message}
                    </p>
                  </div>
                ) : (
                  <ListingGrid
                    listings={listings || []}
                    emptyLabel="No active listings found."
                  />
                )}
              </Suspense>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
