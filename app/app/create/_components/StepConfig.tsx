'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Field from './primitives/Field'
import TwoCols from './primitives/TwoCols'

export default function StepConfig({
  formData,
  errors,
  setField,
  next,
  back,
  nowISO,
}: {
  formData: any
  errors: Record<string, string>
  setField: (k: any, v: any) => void
  next: (target: 'reserve') => void
  back: () => void
  toNum: (v: string) => number
  nowISO: string
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Auction Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.auctionType === 'english' && (
          <Field
            id="min-increment"
            label="Minimum Bid Increment (%)"
            type="number"
            value={String(formData.minIncrement ?? '')}
            onChange={(e) => setField('minIncrement', e.target.value)}
            error={errors.minIncrement}
            hint="Minimum percentage increase required for each new bid."
          />
        )}

        {formData.auctionType === 'dutch' && (
          <>
            <TwoCols>
              <div className="space-y-2">
                <Field
                  id="start-price"
                  label="Start Price (ETH)"
                  type="number"
                  value={String(formData.startPrice ?? '')}
                  onChange={(e) => setField('startPrice', e.target.value)}
                  error={errors.startPrice}
                  step="0.00001"
                  min="0.00001"
                  placeholder="0.001"
                  showEthlogo={true}
                />
                {/* Real-time validation warning for Dutch auction */}
                {formData.startPrice && 
                 formData.reservePrice && 
                 parseFloat(formData.startPrice) <= parseFloat(formData.reservePrice) && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>Start price must be greater than reserve price ({formData.reservePrice} ETH)</span>
                  </div>
                )}
              </div>
              <Field
                id="end-price"
                label="End Price (ETH)"
                type="number"
                value={String(formData.endPrice ?? '')}
                onChange={(e) => setField('endPrice', e.target.value)}
                error={errors.endPrice}
                step="0.00001"
                min="0.00001"
                placeholder="0.0001"
                showEthlogo={true}
              />
            </TwoCols>
            <Field
              id="decay-interval"
              label="Decay Interval (minutes)"
              type="number"
              value={String(formData.decayInterval ?? '')}
              onChange={(e) => setField('decayInterval', e.target.value)}
              error={errors.decayInterval}
              hint="How often the price steps down."
            />
          </>
        )}

        {formData.auctionType === 'sealed' && (
          <>
            <Field
              id="min-bid"
              label="Minimum Bid (ETH)"
              type="number"
              value={String(formData.minBid ?? '')}
              onChange={(e) => setField('minBid', e.target.value)}
              error={errors.minBid}
              step="0.00001"
              min="0.00001"
              placeholder="0.0001"
              showEthlogo={true}
            />
            <TwoCols>
              <Field
                id="commit-window"
                label="Commit Window (hours)"
                type="number"
                value={String(formData.commitWindow ?? '')}
                onChange={(e) => setField('commitWindow', e.target.value)}
                error={errors.commitWindow}
                hint="Minimum 5 minutes (0.083 hours), Maximum 7 days (168 hours)"
                step="0.1"
                min="0.083"
              />
              <Field
                id="reveal-window"
                label="Reveal Window (hours)"
                type="number"
                value={String(formData.revealWindow ?? '')}
                onChange={(e) => setField('revealWindow', e.target.value)}
                error={errors.revealWindow}
                hint="Minimum 5 minutes (0.083 hours), Maximum 7 days (168 hours)"
                step="0.1"
                min="0.083"
              />
            </TwoCols>
            {formData.commitWindow && formData.revealWindow && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Total Auction Duration: {(Number(formData.commitWindow) + Number(formData.revealWindow)).toFixed(1)} hours
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Commit Phase: {Number(formData.commitWindow).toFixed(1)}h → Reveal Phase: {Number(formData.revealWindow).toFixed(1)}h
                </div>
                {formData.startTime && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Start Time: {new Date(formData.startTime).toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ End Time: {new Date(new Date(formData.startTime).getTime() + (Number(formData.commitWindow) + Number(formData.revealWindow)) * 60 * 60 * 1000).toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <TwoCols>
          <Field
            id="start-time"
            label="Start Time WIB (Auto-set)"
            type="datetime-local"
            value={formData.startTime || nowISO}
            onChange={(e) => setField('startTime', e.target.value)}
            error={errors.startTime}
            hint="Automatically set to current WIB time + 5 minutes"
          />
          <Field
            id="end-time"
            label={formData.auctionType === 'sealed' ? 'End Time (Auto-calculated)' : 'End Time'}
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setField('endTime', e.target.value)}
            error={errors.endTime}
            // disabled={formData.auctionType === 'sealed'}
            hint={formData.auctionType === 'sealed' ? 'Calculated from Start Time + Total Duration' : undefined}
          />
        </TwoCols>

        <div className="flex justify-between">
          <Button variant="outline" onClick={back} className="hover:text-black border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
            Back
          </Button>
          <Button 
            onClick={() => next('reserve')}
            disabled={
              (formData.auctionType === 'sealed' && 
                (!formData.commitWindow || !formData.revealWindow || 
                 Number(formData.commitWindow) < 0.083 || Number(formData.revealWindow) < 0.083 ||
                 !formData.startTime))
            }
          >
            Next: Reserve Price
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
