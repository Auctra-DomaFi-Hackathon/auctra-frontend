"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OracleSkeleton() {
  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      {/* Page Header Skeleton */}
      <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm mb-8">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-80 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-28"></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Configuration Form Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Domain Selection Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-72"></div>
          </CardHeader>
          <CardContent>
            {/* Domain Selector Skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              
              {/* Domain Cards Grid Skeleton */}
              <div className="grid grid-cols-1 gap-3 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Oracle Configuration Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-44"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-72"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Value Input Skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
              <div className="relative">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-28 mt-1"></div>
            </div>

            {/* Expiry Years Input Skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mb-2"></div>
              <div className="relative">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-36 mt-1"></div>
            </div>

            {/* Preview Section Skeleton */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-3"></div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Set Premium Button Skeleton */}
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions Section Skeleton */}
      <Card className="mt-8">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-56"></div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mt-0.5 flex-shrink-0"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-3"></div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}