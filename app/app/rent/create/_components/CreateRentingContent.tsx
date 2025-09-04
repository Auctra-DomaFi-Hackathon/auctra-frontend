'use client'

import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs'
import Stepper from './Stepper'
import StepDomain from './StepDomain'
import StepTerms from './StepTerms'
import StepPreview from './StepPreview'
import CreateRentalSkeleton from './CreateRentalSkeleton'
import { useCreateRentingForm } from './hooks/useCreateRentingForm'

export default function CreateRentingContent() {
  const form = useCreateRentingForm()

  if (form.loading) {
    return <CreateRentalSkeleton step={form.currentStep} />
  }

  return (
    <div className="container mx-auto px-6 py-10 pt-30 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Rental Listing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          List your domain NFT for rent and start earning passive income.
        </p>
      </header>

      <Stepper {...form.stepperProps} />

      <Tabs value={form.currentStep} onValueChange={(v) => form.setCurrentStep(v as any)} className="w-full">
        <TabsList className="hidden" />

        <TabsContent value="domain">
          <StepDomain
            {...form.domainStepProps}
            error={form.domainStepProps.error ?? undefined}
          />
        </TabsContent>

        <TabsContent value="terms">
          <StepTerms
            {...form.termsStepProps}
            error={form.termsStepProps.error ?? undefined}
          />
        </TabsContent>

        <TabsContent value="preview">
          <StepPreview
            {...form.previewStepProps}
            error={form.previewStepProps.error ?? undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}