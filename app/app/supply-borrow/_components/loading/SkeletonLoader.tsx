'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SkeletonLoader() {
  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-3 w-64"></div>
        <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-96"></div>
      </div>

      {/* Unified Header Skeleton */}
      <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-white shadow-sm mb-6">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-64"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-80"></div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-64"></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 bg-gray-100 p-1 rounded-lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 min-h-[60px] sm:min-h-[40px]">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              <div className="h-5 w-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Cards Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white border-gray-200">
            <CardContent className="p-4 sm:p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:justify-between mb-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 sm:flex-initial">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16 self-start sm:self-center"></div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-20 sm:w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Individual Domain Card Skeleton for reuse
export function DomainCardSkeleton() {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <div className="animate-pulse">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:justify-between mb-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 sm:flex-initial">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-16 self-start sm:self-center"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-20 sm:w-24"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}