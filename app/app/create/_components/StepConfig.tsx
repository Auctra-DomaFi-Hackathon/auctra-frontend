'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
                showDomaLogo={true}
              />
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
                showDomaLogo={true}
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
              showDomaLogo={true}
            />
            <TwoCols>
              <Field
                id="commit-window"
                label="Commit Window (hours)"
                type="number"
                value={String(formData.commitWindow ?? '')}
                onChange={(e) => setField('commitWindow', e.target.value)}
                error={errors.commitWindow}
              />
              <Field
                id="reveal-window"
                label="Reveal Window (hours)"
                type="number"
                value={String(formData.revealWindow ?? '')}
                onChange={(e) => setField('revealWindow', e.target.value)}
                error={errors.revealWindow}
              />
            </TwoCols>
          </>
        )}

        <TwoCols>
          <Field
            id="start-time"
            label="Start Time"
            type="datetime-local"
            value={formData.startTime || nowISO}
            onChange={(e) => setField('startTime', e.target.value)}
            error={errors.startTime}
          />
          <Field
            id="end-time"
            label="End Time"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setField('endTime', e.target.value)}
            error={errors.endTime}
          />
        </TwoCols>

        <div className="flex justify-between">
          <Button variant="outline" onClick={back}>
            Back
          </Button>
          <Button onClick={() => next('reserve')}>Next: Reserve Price</Button>
        </div>
      </CardContent>
    </Card>
  )
}
