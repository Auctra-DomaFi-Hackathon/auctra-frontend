'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Domain } from '@/types'

export default function AboutTab({ domain }: { domain: Domain }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700">Length</h4>
            <p>{domain.name.split('.')[0].length} characters</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">TLD</h4>
            <p>.{domain.tld}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Expires</h4>
            <p>N/A</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Traffic Score</h4>
            <p>{domain.trafficScore || 'N/A'}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Premium</Badge>
            <Badge variant="outline">Short</Badge>
            <Badge variant="outline">Brandable</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
