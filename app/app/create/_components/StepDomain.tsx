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
    <Card className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
          Select Domain
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Manual input */}
        <div>
          <Label htmlFor="manual-domain" className="text-xs text-neutral-600 dark:text-neutral-300">
            Manual entry
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="manual-domain"
              placeholder="example.com"
              value={formData.domain}
              onChange={(e) =>
                handleManualDomainInput
                  ? handleManualDomainInput(e.target.value)
                  : setField('domain', e.target.value)
              }
              className="pr-9 text-sm"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {searchingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </span>
          </div>

        {/* Search result (compact) */}
        {domainSearchResult && (
          <button
            type="button"
            onClick={() => selectSearchedDomain && selectSearchedDomain(domainSearchResult)}
            className={cn(
              'mt-2 w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors',
              domainSearchResult.id.startsWith('manual-')
                ? 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/60'
                : 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
              formData.domainId === domainSearchResult.id && 'ring-1 ring-blue-500'
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div
                  className={cn(
                    'truncate font-medium',
                    domainSearchResult.id.startsWith('manual-')
                      ? 'text-neutral-900 dark:text-neutral-100'
                      : 'text-blue-800 dark:text-blue-300'
                  )}
                >
                  {domainSearchResult.name}
                </div>
                <div
                  className={cn(
                    'truncate text-xs',
                    domainSearchResult.id.startsWith('manual-')
                      ? 'text-neutral-500 dark:text-neutral-400'
                      : 'text-blue-700 dark:text-blue-400'
                  )}
                >
                  {domainSearchResult.id.startsWith('manual-')
                    ? 'Manual entry — click to use'
                    : 'From your wallet — click to select'}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {!domainSearchResult.id.startsWith('manual-') && (
                  <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                    <BadgeCheck className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Owned
                  </Badge>
                )}
                <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                  {domainSearchResult.id.startsWith('manual-') ? 'Manual' : 'Found'}
                </Badge>
              </div>
            </div>
          </button>
        )}

          {errors.domain && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.domain}</p>
          )}
        </div>

        {/* Wallet domains */}
        <div>
          <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            Your domains ({myDomains.length})
          </div>

          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {myDomains.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => handleDomainSelect(d)}
                  className={cn(
                    'w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors',
                    'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-900/70',
                    formData.domainId === d.id &&
                      'border-blue-300 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-900/50 dark:bg-blue-900/20'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
                        {d.name}
                      </div>
                      <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                        Exp: {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                      <BadgeCheck className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Verified
                    </Badge>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Next */}
        <div className="flex justify-end pt-1">
          <Button
            onClick={() => next('type')}
            disabled={!hasDomain}
            className="h-9 rounded-lg bg-blue-600 text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Next: Auction Type
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
