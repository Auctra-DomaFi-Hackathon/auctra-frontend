'use client'

import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs'
import Stepper from './_components/Stepper'
import StepDomain from './_components/StepDomain'
import StepType from './_components/StepType'
import StepConfig from './_components/StepConfig'
import StepReserve from './_components/StepReserve'
import StepPreview from './_components/StepPreview'
import LoadingState from './_components/LoadingState'
import AuctionSuccessModal from './_components/AuctionSuccessModal'
import { useCreateAuctionForm } from './_components/hooks/useCreateAuctionForm'

export default function CreateAuctionPage() {
  const form = useCreateAuctionForm()

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Auction</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          List your domain with transparent on-chain price discovery.
        </p>
      </header>

      <Stepper {...form.stepperProps} />

      <Tabs value={form.currentStep} onValueChange={(v) => form.setCurrentStep(v as any)} className="w-full">
        <TabsList className="hidden" />

        <TabsContent value="domain">
          <StepDomain {...form.domainStepProps} />
        </TabsContent>

        <TabsContent value="type">
          <StepType {...form.typeStepProps} />
        </TabsContent>

        <TabsContent value="config">
          <StepConfig {...form.configStepProps} />
        </TabsContent>

        <TabsContent value="reserve">
          <StepReserve {...form.reserveStepProps} />
        </TabsContent>

        <TabsContent value="preview">
          <StepPreview {...form.previewStepProps} />
        </TabsContent>
      </Tabs>
      
      {/* Success Modal */}
      <AuctionSuccessModal 
        {...form.successModalProps} 
        reservePrice={typeof form.successModalProps.reservePrice === 'string' 
          ? parseFloat(form.successModalProps.reservePrice) 
          : form.successModalProps.reservePrice
        } 
      />
    </div>
  )
}
