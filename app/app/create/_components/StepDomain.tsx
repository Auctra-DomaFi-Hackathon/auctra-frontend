'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BadgeCheck, Search, Loader2 } from 'lucide-react'
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
  domainSearchResult,
  searchingDomain,
  handleManualDomainInput,
  selectSearchedDomain,
}: {
  formData: any
  errors: Record<string, string>
  myDomains: Domain[]
  hasDomain: boolean
  handleDomainSelect: (d: Domain) => void
  setField: (k: any, v: any) => void
  next: (target: 'type') => void
  domainSearchResult?: Domain | null
  searchingDomain?: boolean
  handleManualDomainInput?: (value: string) => void
  selectSearchedDomain?: (domain: Domain) => void
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Select Domain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="manual-domain" className='text-black dark:text-white'>Manual Entry</Label>
          <div className="relative mt-3">
            <Input
              id="manual-domain"
              placeholder="e.g., example.com"
              value={formData.domain}
              onChange={(e) => handleManualDomainInput ? handleManualDomainInput(e.target.value) : setField('domain', e.target.value)}
              className='pr-10'
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {searchingDomain ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <Search className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
          
          {/* Search Result */}
          {domainSearchResult && (
            <div className="mt-2">
              <Card 
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  domainSearchResult.id.startsWith('manual-') 
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50',
                  formData.domainId === domainSearchResult.id ? 'ring-2 ring-blue-600 dark:ring-blue-400' : ''
                )}
                onClick={() => selectSearchedDomain && selectSearchedDomain(domainSearchResult)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={cn(
                        'font-medium',
                        domainSearchResult.id.startsWith('manual-')
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-blue-900 dark:text-blue-100'
                      )}>
                        {domainSearchResult.name}
                      </h4>
                      <p className={cn(
                        'text-xs',
                        domainSearchResult.id.startsWith('manual-')
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-blue-700 dark:text-blue-300'
                      )}>
                        {domainSearchResult.id.startsWith('manual-') 
                          ? 'Manual entry - Click to continue with this domain'
                          : 'From your domains - Click to select'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!domainSearchResult.id.startsWith('manual-') && (
                        <Badge variant="outline" className="gap-1 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300">
                          <BadgeCheck className="w-3 h-3" />
                          Owned
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          domainSearchResult.id.startsWith('manual-')
                            ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                            : 'border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                        )}
                      >
                        {domainSearchResult.id.startsWith('manual-') ? 'Manual' : 'Found'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
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
