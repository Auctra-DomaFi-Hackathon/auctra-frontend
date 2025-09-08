'use client'

import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import LoadingList from './LoadingList'
import Empty from './Empty'
import Row from './Row'

export default function HistoryList({
  loading, grouped, hasItems,
}: {
  loading: boolean
  grouped: Record<string, any[]>
  hasItems: boolean
}) {
  return (
    <>
      <Separator className="mb-3 sm:mb-4 bg-gray-200 dark:bg-gray-700" />

      {/* Di mobile: auto height (ikut konten). Di md+: tinggi tetap agar list scroll sendiri */}
      <div className="md:hidden">
        {loading ? (
          <LoadingList />
        ) : !hasItems ? (
          <Empty />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([day, items]) => (
              <div key={day}>
                <div className="mb-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{day}</div>
                <div className="space-y-2">
                  {items.map((i: any) => <Row key={i.id} item={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop/Large: ScrollArea fixed height */}
      <ScrollArea className="hidden md:block pr-2" style={{ height: '60vh' }}>
        {loading ? (
          <LoadingList />
        ) : !hasItems ? (
          <Empty />
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([day, items]) => (
              <div key={day}>
                <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">{day}</div>
                <div className="space-y-2">
                  {items.map((i: any) => <Row key={i.id} item={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  )
}
