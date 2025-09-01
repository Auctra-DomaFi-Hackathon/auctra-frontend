'use client'

import PositionHeader from './_components/header/PositionHeader'
import HealthCard from './_components/sections/HealthCard'
import OverviewPanel from './_components/sections/OverviewPanel'
import SupplyPanel from './_components/sections/SupplyPanel'
import BorrowPanel from './_components/sections/BorrowPanel'
import ManagePanel from './_components/sections/ManagePanel'
import LoadingState from './_components/LoadingState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { usePositionDetail } from './_components/hooks/usePositionDetail'

export default function PositionDetailPage({ params }: { params: { slug: string } }) {
  const {
    loading, position, activeTab, setActiveTab,
    metrics, handlers,
  } = usePositionDetail(params.slug)

  if (loading) return <LoadingState label="Loading position..." />

  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      <PositionHeader position={position} metrics={metrics} />

      <HealthCard metrics={metrics} className="mb-8" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supply">Supply</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewPanel position={position} metrics={metrics} />
        </TabsContent>

        <TabsContent value="supply" className="mt-6">
          <SupplyPanel position={position} metrics={metrics} onSupply={handlers.handleSupply} supplyAmount={handlers.supplyAmount} setSupplyAmount={handlers.setSupplyAmount}/>
        </TabsContent>

        <TabsContent value="borrow" className="mt-6">
          <BorrowPanel position={position} metrics={metrics} onBorrow={handlers.handleBorrow} borrowAmount={handlers.borrowAmount} setBorrowAmount={handlers.setBorrowAmount}/>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <ManagePanel position={position} metrics={metrics} onRepay={handlers.handleRepay} repayAmount={handlers.repayAmount} setRepayAmount={handlers.setRepayAmount} onWithdraw={handlers.handleWithdraw}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
