'use client'

import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { AuctionKind } from '../hooks/useCreateAuctionForm'

export default function OptionBlock({
  id,
  value,
  title,
  desc,
  selected,
}: {
  id: string
  value: AuctionKind
  title: string
  desc: string
  selected: boolean
}) {
  return (
    <div className={cn('flex items-start space-x-3 p-4 border rounded-lg', selected ? 'border-blue-600' : 'border-gray-200')}>
      <RadioGroupItem value={value} id={id} className="mt-1" />
      <div className="flex-1">
        <Label htmlFor={id} className="text-lg font-semibold">
          {title}
        </Label>
        <p className="text-gray-600 mt-1">{desc}</p>
      </div>
    </div>
  )
}
