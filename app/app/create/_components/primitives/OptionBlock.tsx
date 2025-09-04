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
    <div className={cn('flex items-start space-x-3 p-4 border rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200', selected ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700')}>
      <RadioGroupItem value={value} id={id} className="mt-1" />
      <div className="flex-1">
        <Label htmlFor={id} className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer">
          {title}
        </Label>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{desc}</p>
      </div>
    </div>
  )
}
