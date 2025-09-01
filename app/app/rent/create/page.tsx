'use client'

import { Suspense } from 'react'
import CreateRentalSkeleton from './_components/CreateRentalSkeleton'
import CreateRentingContent from './_components/CreateRentingContent'

export default function CreateRentingPage() {
  return (
    <Suspense fallback={<CreateRentalSkeleton step="domain" />}>
      <CreateRentingContent />
    </Suspense>
  )
}