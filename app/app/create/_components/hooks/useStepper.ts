'use client'

import { useMemo, useState } from 'react'

export function useStepper<T extends readonly { id: string }[]>(steps: T) {
  const [currentStep, setCurrentStep] = useState<T[number]['id']>(steps[0].id as any)
  const currentIndex = useMemo(() => steps.findIndex((s) => s.id === currentStep), [steps, currentStep])
  const isCompleted = (index: number) => currentIndex > index
  return { currentStep, setCurrentStep, currentIndex, isCompleted }
}
