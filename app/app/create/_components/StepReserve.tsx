'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Field from './primitives/Field'

export default function StepReserve({
  formData,
  errors,
  setField,
  next,
  back,
  suggestedReserve,
  handleSuggestReserve,
  toNum,
}: {
  formData: any
  errors: Record<string, string>
  setField: (k: any, v: any) => void
  next: (target: 'preview') => void
  back: () => void
  suggestedReserve: { reserve: number; rationale: string[] } | null
  handleSuggestReserve: () => Promise<void> | void
  toNum: (v: string) => number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Reserve Price</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field
          id="reserve-price"
          label="Reserve Price ($)"
          type="number"
          value={String(formData.reservePrice)}
          onChange={(e) => setField('reservePrice', toNum(e.target.value))}
          error={errors.reservePrice}
          hint="Minimum acceptable price to sell the domain."
        />

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSuggestReserve}>
            Suggest via Oracle
          </Button>
          {suggestedReserve && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200" variant="outline">
              Suggested: ${suggestedReserve.reserve.toLocaleString()}
            </Badge>
          )}
        </div>

        {suggestedReserve && (
          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Oracle Rationale</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {suggestedReserve.rationale.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="auto-listing"
            checked={formData.autoListing}
            onCheckedChange={(c) => setField('autoListing', !!c)}
          />
          <Label htmlFor="auto-listing">Auto-list if auction doesn’t meet reserve</Label>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={back}>
            Back
          </Button>
          <Button onClick={() => next('preview')}>Next: Preview</Button>
        </div>
      </CardContent>
    </Card>
  )
}
