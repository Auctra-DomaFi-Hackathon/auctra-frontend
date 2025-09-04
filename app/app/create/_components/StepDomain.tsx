'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Domain } from '@/types'

export default function StepDomain({
  formData,
  errors,
  myDomains,
  hasDomain,
  handleDomainSelect,
  setField,
  next,
}: {
  formData: any
  errors: Record<string, string>
  myDomains: Domain[]
  hasDomain: boolean
  handleDomainSelect: (d: Domain) => void
  setField: (k: any, v: any) => void
  next: (target: 'type') => void
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Select Domain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="manual-domain" className='text-black dark:text-white'>Manual Entry</Label>
          <Input
            id="manual-domain"
            placeholder="e.g., example.com"
            value={formData.domain}
            onChange={(e) => setField('domain', e.target.value)}
            className='mt-3'
          />
          {errors.domain && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.domain}</p>}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Domains</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myDomains.map((domain) => (
              <Card
                key={domain.id}
                className={cn(
                  'cursor-pointer transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
                  formData.domainId === domain.id ? 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'hover:shadow-md'
                )}
                onClick={() => handleDomainSelect(domain)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{domain.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Exp: {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <BadgeCheck className="w-4 h-4 text-blue-600" />
                     <span className='text-black dark:text-white'>Verified</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => next('type')} disabled={!hasDomain}>
            Next: Auction Type
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
