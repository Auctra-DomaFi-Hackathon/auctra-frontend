'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import PageHeader from './_components/header/PageHeader'
import Controls from './_components/header/Controls'
import KpiGrid from './_components/kpi/KpiGrid'
import LoadingState from './_components/LoadingState'
import { useDashboardData } from './_components/hooks/useDashboardData'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Lazy load heavy table components
const AuctionsTable = dynamic(() => import('./_components/tables/AuctionsTable'), {
  loading: () => <div className="h-32 bg-gray-50 animate-pulse rounded-lg"></div>
})
const BidsTable = dynamic(() => import('./_components/tables/BidsTable'), {
  loading: () => <div className="h-32 bg-gray-50 animate-pulse rounded-lg"></div>
})
const DomainsTable = dynamic(() => import('./_components/tables/DomainsTable'), {
  loading: () => <div className="h-32 bg-gray-50 animate-pulse rounded-lg"></div>
})

export default function DashboardPage() {
  const {
    loading, tab, setTab, query, setQuery,
    kpis, auctions, bids, domains, domainsError,
  } = useDashboardData()

  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      <PageHeader />

      <KpiGrid items={kpis} className="mb-6" />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="bg-blue-50/40">
            <TabsTrigger value="auctions" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">My Auctions</TabsTrigger>
            <TabsTrigger value="bids" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">My Bids</TabsTrigger>
            <TabsTrigger value="domains" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">My Domains</TabsTrigger>
          </TabsList>
        </Tabs>

        <Controls query={query} setQuery={setQuery} />
      </div>

      <div className="space-y-4">
        <Tabs value={tab}>
          <TabsContent value="auctions">
            <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-lg"></div>}>
              <AuctionsTable rows={auctions || []} />
            </Suspense>
          </TabsContent>
          <TabsContent value="bids">
            <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-lg"></div>}>
              <BidsTable rows={bids || []} />
            </Suspense>
          </TabsContent>
          <TabsContent value="domains">
            <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-lg"></div>}>
              <DomainsTable rows={domains || []} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
