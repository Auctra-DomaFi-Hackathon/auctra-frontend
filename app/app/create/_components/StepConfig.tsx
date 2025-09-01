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
  toNum,
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
    <Card>
      <CardHeader>
        <CardTitle>Auction Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.auctionType === 'dutch' && (
          <>
            <TwoCols>
              <Field
                id="start-price"
                label="Start Price ($)"
                type="number"
                value={String(formData.startPrice ?? '')}
                onChange={(e) => setField('startPrice', toNum(e.target.value))}
                error={errors.startPrice}
              />
              <Field
                id="end-price"
                label="End Price ($)"
                type="number"
                value={String(formData.endPrice ?? '')}
                onChange={(e) => setField('endPrice', toNum(e.target.value))}
                error={errors.endPrice}
              />
            </TwoCols>
            <Field
              id="decay-interval"
              label="Decay Interval (minutes)"
              type="number"
              value={String(formData.decayInterval ?? '')}
              onChange={(e) => setField('decayInterval', toNum(e.target.value))}
              error={errors.decayInterval}
              hint="How often the price steps down."
            />
          </>
        )}

        {formData.auctionType === 'sealed' && (
          <>
            <Field
              id="min-bid"
              label="Minimum Bid ($)"
              type="number"
              value={String(formData.minBid ?? '')}
              onChange={(e) => setField('minBid', toNum(e.target.value))}
              error={errors.minBid}
            />
            <TwoCols>
              <Field
                id="commit-window"
                label="Commit Window (hours)"
                type="number"
                value={String(formData.commitWindow ?? '')}
                onChange={(e) => setField('commitWindow', toNum(e.target.value))}
                error={errors.commitWindow}
              />
              <Field
                id="reveal-window"
                label="Reveal Window (hours)"
                type="number"
                value={String(formData.revealWindow ?? '')}
                onChange={(e) => setField('revealWindow', toNum(e.target.value))}
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
