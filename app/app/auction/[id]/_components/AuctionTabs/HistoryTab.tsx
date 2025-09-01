'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import type { Auction } from '@/types'

export default function HistoryTab({ auction }: { auction: Auction }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {auction.activity && auction.activity.length > 0 ? (
            auction.activity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium">{activity.type}</span>
                    <p className="text-sm text-gray-600">by {activity.actor}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amountUsd && (
                    <div className="font-semibold">${activity.amountUsd.toLocaleString()}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No activity yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
