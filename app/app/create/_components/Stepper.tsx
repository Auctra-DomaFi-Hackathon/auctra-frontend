'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Info, SlidersHorizontal, DollarSign, BadgeCheck } from 'lucide-react'

const ICONS: Record<string, any> = { CheckCircle2, Info, SlidersHorizontal, DollarSign, BadgeCheck }

export default function Stepper({
  steps,
  currentStep,
  currentIndex,
  isCompleted,
}: {
  steps: readonly { id: string; label: string; icon: string }[]
  currentStep: string
  currentIndex: number
  isCompleted: (i: number) => boolean
}) {
  return (
    <div className="flex items-center justify-between mb-8 px-1">
      {steps.map((step, index) => {
        const Icon = ICONS[step.icon] ?? CheckCircle2
        const active = currentStep === step.id
        const completed = isCompleted(index)
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2',
                active && 'bg-blue-600 border-blue-600 text-white',
                completed && 'bg-green-600 border-green-600 text-white',
                !active && !completed && 'border-gray-300 text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={cn(
                'ml-2 text-sm font-medium',
                active && 'text-blue-600',
                completed && 'text-green-700',
                !active && !completed && 'text-gray-500'
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={cn('w-16 h-px mx-4', currentIndex > index ? 'bg-green-600' : 'bg-gray-300')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
