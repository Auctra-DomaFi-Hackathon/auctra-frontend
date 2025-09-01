'use client'

import { Card, CardContent } from "@/components/ui/card"

interface StepLoadingSkeletonProps {
  step: 'domain' | 'terms' | 'preview'
  message?: string
}

export default function StepLoadingSkeleton({ step, message }: StepLoadingSkeletonProps) {
  const getStepMessage = () => {
    switch (step) {
      case 'domain': return message || 'Loading domain information...'
      case 'terms': return message || 'Preparing rental terms...'
      case 'preview': return message || 'Generating listing preview...'
      default: return 'Loading...'
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'domain': return 'Select Domain'
      case 'terms': return 'Set Terms'
      case 'preview': return 'Review & Publish'
      default: return 'Loading'
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 pt-20 sm:pt-30 max-w-4xl">
      {/* Header - Always show */}
      <header className="mb-6 sm:mb-8">
        <div className="h-8 sm:h-10 lg:h-12 bg-gray-200 rounded-lg animate-pulse mb-2 w-72 sm:w-80 lg:w-96"></div>
        <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 rounded-lg animate-pulse w-80 sm:w-96 lg:w-[28rem]"></div>
      </header>

      {/* Stepper with active state */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          {/* Step 1 - Domain */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-pulse flex-shrink-0 ${
              step === 'domain' ? 'bg-blue-300' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col gap-1">
              <div className={`h-3 sm:h-4 rounded animate-pulse w-16 sm:w-20 ${
                step === 'domain' ? 'bg-blue-200' : 'bg-gray-200'
              }`}></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
            </div>
            <div className="hidden sm:block flex-1 h-px bg-gray-200 animate-pulse ml-4"></div>
          </div>
          
          {/* Step 2 - Terms */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-pulse flex-shrink-0 ${
              step === 'terms' ? 'bg-blue-300' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col gap-1">
              <div className={`h-3 sm:h-4 rounded animate-pulse w-12 sm:w-16 ${
                step === 'terms' ? 'bg-blue-200' : 'bg-gray-200'
              }`}></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
            </div>
            <div className="hidden sm:block flex-1 h-px bg-gray-200 animate-pulse ml-4"></div>
          </div>
          
          {/* Step 3 - Preview */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-pulse flex-shrink-0 ${
              step === 'preview' ? 'bg-blue-300' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col gap-1">
              <div className={`h-3 sm:h-4 rounded animate-pulse w-14 sm:w-18 ${
                step === 'preview' ? 'bg-blue-200' : 'bg-gray-200'
              }`}></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-18 sm:w-24"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center mb-6">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="h-5 bg-blue-100 rounded animate-pulse w-48 sm:w-64 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-32 sm:w-40 mx-auto"></div>
      </div>

      {/* Step-specific skeleton content */}
      <Card className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-blue-100">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {step === 'domain' && <DomainStepSkeleton />}
          {step === 'terms' && <TermsStepSkeleton />}
          {step === 'preview' && <PreviewStepSkeleton />}
        </CardContent>
      </Card>

      {/* Footer hint */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-56 sm:w-72 mx-auto"></div>
      </div>
    </div>
  )
}

function DomainStepSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="relative">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-16 h-6 bg-blue-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TermsStepSkeleton() {
  return (
    <div className="space-y-6">
      {/* Selected Domain */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-blue-200 rounded animate-pulse w-32"></div>
            <div className="h-3 bg-blue-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>

      {/* Terms Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Additional Terms */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  )
}

function PreviewStepSkeleton() {
  return (
    <div className="space-y-6">
      {/* Listing Preview */}
      <div className="border-2 border-blue-100 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
          <div className="w-16 h-6 bg-green-200 rounded-full animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>
        ))}
      </div>
    </div>
  )
}