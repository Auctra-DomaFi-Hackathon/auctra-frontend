'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { Domain } from '@/types'

export default function ReserveTab({ domain }: { domain: Domain }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Oracle Reserve Price</h3>
          <div className="text-2xl font-bold text-blue-600">
            ${domain.oracleReserveUsd?.toLocaleString() || 'N/A'}
          </div>
          <p className="text-gray-600 mt-2">
            Confidence: {Math.round((domain.oracleConfidence || 0) * 100)}%
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Valuation Factors:</h4>
          <ul className="text-sm space-y-1">
            <li>• Domain length and memorability</li>
            <li>• Historical traffic data</li>
            <li>• TLD market performance</li>
            <li>• Keyword search volume</li>
            <li>• Comparable sales data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
