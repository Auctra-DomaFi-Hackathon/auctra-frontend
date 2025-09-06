'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import ExploreHeader from './_components/header/ExploreHeader'
import StatusTabs from './_components/header/StatusTabs'
import LoadingGrid from './_components/LoadingGrid'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useExploreData } from './_components/hooks/useExploreData'

// Lazy load heavy components with better loading states
const FilterSidebar = dynamic(() => import('./_components/sidebar/FilterSidebar'), {
  loading: () => <FilterSidebarSkeleton />,
  ssr: false // Prevent SSR for better performance
})
const AuctionGrid = dynamic(() => import('./_components/grid/AuctionGrid'), {
  loading: () => <LoadingGrid count={6} />,
  ssr: false
})
// Use PaginatedListingGrid for button-based pagination
const PaginatedListingGrid = dynamic(() => import('./_components/PaginatedListingGrid'), {
  loading: () => <LoadingGrid count={6} />,
  ssr: false
})

// Skeleton component for filter sidebar
function FilterSidebarSkeleton() {
  return (
    <div className="w-full lg:w-80 space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      <div className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
    </div>
  )
}

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
    listingsPage,
    listingsTotalPages,
    onListingsPageChange,
    onAuctionPageChange,
    currentPage,
    // Add pricing and timing data
    currentPrices,
    auctionTimes,
    isDataReady
  } = useExploreData()
  
  // Show initial loading state with better skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <FilterSidebarSkeleton />
          <div className="flex-1">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg mb-6" />
            <LoadingGrid count={6} />
          </div>
        </div>
      </div>
    )
  }

  // Debug information (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Explore page debug info:', {
      loading,
      listingsCount: listings?.length || 0,
      listingsError,
      filteredListingsCount: listings?.length || 0,
      tab,
      searchQuery,
      selectedTLDs,
      selectedTypes
    });
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Filter Panel */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-6 order-2 lg:order-1">
          <Suspense fallback={<FilterSidebarSkeleton />}>
            <FilterSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              tlds={tlds.filter((tld): tld is string => tld !== undefined)}
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
            {(['liquidation'] as const).map((s) => (
              <TabsContent key={s} value={s}>
                <Suspense fallback={<LoadingGrid count={6} />}>
                  <AuctionGrid
                    auctions={byStatus[s]?.items || []}
                    domainById={domainById}
                    emptyLabel={`No ${s} auctions found matching your criteria.`}
                    currentPage={currentPage[s] || 1}
                    totalPages={byStatus[s]?.totalPages || 1}
                    onPageChange={(page) => onAuctionPageChange(s, page)}
                  />
                </Suspense>
              </TabsContent>
            ))}
            <TabsContent value="listings">
              <Suspense fallback={<LoadingGrid count={6} />}>
                {listingsError ? (
                  <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 mb-4">
                      Failed to load listings: {listingsError.message}
                    </p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : isDataReady ? (
                  <PaginatedListingGrid
                    allListings={listings || []}
                    emptyLabel="No active listings found. Try adjusting your filters or check back later."
                    currentPrices={currentPrices || {}}
                    auctionTimes={auctionTimes || {}}
                    cacheKey={`listings-${searchQuery}-${selectedTLDs.join(',')}-${selectedTypes.join(',')}-${sortBy}`}
                  />
                ) : (
                  <LoadingGrid count={6} />
                )}
              </Suspense>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
