'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CreateRentalSkeletonProps {
  step?: 'domain' | 'terms' | 'preview'
}

export default function CreateRentalSkeleton({ step = 'domain' }: CreateRentalSkeletonProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 pt-20 sm:pt-30 max-w-4xl">
      {/* Header Section */}
      <header className="mb-6 sm:mb-8">
        <div className="h-8 sm:h-10 lg:h-12 bg-gray-200 rounded-lg animate-pulse mb-2 w-72 sm:w-80 lg:w-96"></div>
        <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 rounded-lg animate-pulse w-80 sm:w-96 lg:w-[28rem]"></div>
      </header>

      {/* Stepper Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          {/* Step 1 - Domain */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-pulse flex-shrink-0 ${
              step === 'domain' ? 'bg-blue-200' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col gap-1">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
            </div>
            <div className="hidden sm:block flex-1 h-px bg-gray-200 animate-pulse ml-4"></div>
          </div>
          
          {/* Step 2 - Terms */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-pulse flex-shrink-0 ${
              step === 'terms' ? 'bg-blue-200' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col gap-1">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
            </div>
            <div className="hidden sm:block flex-1 h-px bg-gray-200 animate-pulse ml-4"></div>
          </div>
          
          {/* Step 3 - Preview */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-pulse flex-shrink-0 ${
              step === 'preview' ? 'bg-blue-200' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col gap-1">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-14 sm:w-18"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-18 sm:w-24"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-blue-100">
        {step === 'domain' && <DomainStepSkeleton />}
        {step === 'terms' && <TermsStepSkeleton />}
        {step === 'preview' && <PreviewStepSkeleton />}
      </Card>

      {/* Progress Indicator */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-48 sm:w-64 mx-auto mb-2"></div>
        <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-32 sm:w-40 mx-auto"></div>
      </div>
    </div>
  )
}

// Domain Step Skeleton
function DomainStepSkeleton() {
  return (
    <CardContent className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Step Title */}
        <div className="text-center space-y-2">
          <div className="h-6 sm:h-7 bg-gray-200 rounded animate-pulse w-48 sm:w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-64 sm:w-80 mx-auto"></div>
        </div>
        
        {/* Domain Input Section */}
        <div className="space-y-4">
          <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse w-32 sm:w-40"></div>
          <div className="relative">
            <div className="h-12 sm:h-14 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-16 sm:w-20 h-6 sm:h-8 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-72 sm:w-96"></div>
        </div>

        {/* Domain Selection Grid */}
        <div className="space-y-4">
          <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse w-40 sm:w-48"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 border-2 rounded-lg space-y-3 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24 sm:w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20 sm:w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
          <div className="h-10 sm:h-11 bg-gray-200 rounded-lg animate-pulse w-full sm:w-24"></div>
          <div className="h-10 sm:h-11 bg-blue-200 rounded-lg animate-pulse w-full sm:w-20"></div>
        </div>
      </div>
    </CardContent>
  )
}

// Terms Step Skeleton
function TermsStepSkeleton() {
  return (
    <CardContent className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Step Title */}
        <div className="text-center space-y-2">
          <div className="h-6 sm:h-7 bg-gray-200 rounded animate-pulse w-40 sm:w-56 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-72 sm:w-96 mx-auto"></div>
        </div>

        {/* Selected Domain Display */}
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
          </div>
        </div>
        
        {/* Rental Terms Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
            <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Additional Terms */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-36"></div>
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
          <div className="h-10 sm:h-11 bg-gray-200 rounded-lg animate-pulse w-full sm:w-24"></div>
          <div className="h-10 sm:h-11 bg-blue-200 rounded-lg animate-pulse w-full sm:w-20"></div>
        </div>
      </div>
    </CardContent>
  )
}

// Preview Step Skeleton
function PreviewStepSkeleton() {
  return (
    <CardContent className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Step Title */}
        <div className="text-center space-y-2">
          <div className="h-6 sm:h-7 bg-gray-200 rounded animate-pulse w-48 sm:w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-80 sm:w-96 mx-auto"></div>
        </div>

        {/* Listing Preview Card */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-32 sm:w-40"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20 sm:w-24"></div>
                </div>
              </div>
              <div className="w-16 h-6 bg-green-200 rounded-full animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Checklist */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-64 sm:w-80"></div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
          <div className="h-10 sm:h-11 bg-gray-200 rounded-lg animate-pulse w-full sm:w-24"></div>
          <div className="h-10 sm:h-11 bg-green-200 rounded-lg animate-pulse w-full sm:w-32"></div>
        </div>
      </div>
    </CardContent>
  )
}