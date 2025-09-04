"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LendingPoolSkeleton() {
  return (
    <div className="container mx-auto px-6 lg:px-12 py-10 space-y-8">
      {/* Page Header Skeleton */}
      <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm dark:border-gray-700 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-64 mb-2 dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-96 dark:bg-gray-700"></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24 dark:bg-gray-700"></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pool Overview Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2 dark:bg-gray-700"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-24 dark:bg-gray-700"></div>
                  </div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Action Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Supply Panel Skeleton */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 dark:bg-gray-700"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64 dark:bg-gray-700"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 dark:bg-gray-700"></div>
              <div className="relative">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24 dark:bg-gray-700"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32 dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-800 dark:border dark:border-gray-700">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="text-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-1 dark:bg-gray-700"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mx-auto dark:bg-gray-700"></div>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
          </CardContent>
        </Card>

        {/* Borrow Panel Skeleton */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 dark:bg-gray-700"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64 dark:bg-gray-700"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Selection */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 dark:bg-gray-700"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 dark:bg-gray-700"></div>
              <div className="relative">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Health Factor */}
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 dark:bg-gray-700"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
            </div>

            {/* Button */}
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
          </CardContent>
        </Card>
      </div>

      {/* Pool Parameters Skeleton */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-40 dark:bg-gray-700"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-2 dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}