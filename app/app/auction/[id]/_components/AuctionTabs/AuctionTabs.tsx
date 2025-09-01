'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReserveTab from './ReserveTab'
import HistoryTab from './HistoryTab'
import AboutTab from './AboutTab'
import type { Auction, Domain } from '@/types'

export default function AuctionTabs({
  auction,
  domain,
}: {
  auction: Auction
  domain: Domain
}) {
  return (
    <Tabs defaultValue="reserve" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="reserve">Reserve (Oracle)</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="about">About Domain</TabsTrigger>
      </TabsList>

      <TabsContent value="reserve">
        <ReserveTab domain={domain} />
      </TabsContent>

      <TabsContent value="history">
        <HistoryTab auction={auction} />
      </TabsContent>

      <TabsContent value="about">
        <AboutTab domain={domain} />
      </TabsContent>
    </Tabs>
  )
}
