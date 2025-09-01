'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function HealthCard({ metrics, className }: any) {
  const { healthFactor } = metrics
  return (
    <Card className={`mb-8 border-gray-200 shadow-sm ${className || ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium text-gray-900">Position Health</div>
          <div className="text-sm text-gray-600">
            {healthFactor > 1.5 ? 'Healthy' : healthFactor > 1.2 ? 'Monitor' : 'At Risk'}
          </div>
        </div>
        <Progress value={Math.min(100, (healthFactor / 2) * 100)} className="h-3" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Liquidation Risk</span><span>Optimal Range</span><span>Very Safe</span>
        </div>
      </CardContent>
    </Card>
  )
}
