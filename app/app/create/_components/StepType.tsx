'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RadioGroup } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import OptionBlock from './primitives/OptionBlock'
import type { AuctionKind } from './hooks/useCreateAuctionForm'

export default function StepType({
  formData,
  errors,
  setField,
  next,
  back,
}: {
  formData: any
  errors: Record<string, string>
  setField: (k: any, v: any) => void
  next: (target: 'config') => void
  back: () => void
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-[14px] font-semibold text-gray-900 dark:text-white">
          Choose Auction Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={formData.auctionType}
          onValueChange={(v: AuctionKind) => setField('auctionType', v)}
          className="space-y-3"
        >
          <OptionBlock
            id="english"
            value="english"
            title="English Auction"
            desc="Traditional auction where bidders compete with higher bids."
            selected={formData.auctionType === 'english'}
            onClick={(value) => setField('auctionType', value)}
          />
          <OptionBlock
            id="dutch"
            value="dutch"
            title="Dutch Auction"
            desc="Price starts high and decays until someone buys."
            selected={formData.auctionType === 'dutch'}
            onClick={(value) => setField('auctionType', value)}
          />
          <OptionBlock
            id="sealed"
            value="sealed"
            title="Sealed Bid Auction"
            desc="Bidders commit secret bids, reveal later. Highest wins."
            selected={formData.auctionType === 'sealed'}
            onClick={(value) => setField('auctionType', value)}
          />
        </RadioGroup>

        {errors.auctionType && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.auctionType}</p>
        )}

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={back}
            className="h-8 px-3 text-[13px] rounded-lg"
          >
            Back
          </Button>
          <Button
            onClick={() => next('config')}
            className="h-8 px-4 text-[13px] rounded-lg"
          >
            Next: Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
