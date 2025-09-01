'use client'

import PageHeader from './_components/header/PageHeader'
import Filters from './_components/header/Filters'
import HistoryList from './_components/list/HistoryList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { History as HistoryIcon } from 'lucide-react'
import { useHistoryData } from './_components/hooks/useHistoryData'

export default function HistoryPage() {
  const { search, setSearch, active, setActive, loading, grouped, flat } = useHistoryData()

  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      <PageHeader />

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-blue-600" />
            Activity & Alerts
          </CardTitle>

          <Filters search={search} setSearch={setSearch} active={active} setActive={setActive} />
        </CardHeader>

        <CardContent>
          <HistoryList loading={loading} grouped={grouped} hasItems={flat.length > 0} />
        </CardContent>
      </Card>
    </div>
  )
}
