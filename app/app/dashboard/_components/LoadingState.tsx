'use client'

export default function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="container mx-auto px-6 lg:px-12 py-10 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-6">
        <div className="h-9 bg-blue-100/60 rounded-lg w-48 mb-2"></div>
        <div className="h-5 bg-blue-100/40 rounded w-96"></div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-blue-100/60 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-blue-100/50 rounded-lg"></div>
              <div className="w-6 h-6 bg-blue-100/40 rounded"></div>
            </div>
            <div className="h-8 bg-blue-100/60 rounded w-20 mb-1"></div>
            <div className="h-4 bg-blue-100/40 rounded w-24"></div>
          </div>
        ))}
      </div>

      {/* Tabs and Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div className="flex space-x-1 bg-blue-50/40 p-1 rounded-lg w-fit">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-blue-100/50 rounded px-4 w-28"></div>
          ))}
        </div>
        <div className="h-10 bg-blue-100/40 rounded-lg w-64"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-blue-100/60 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-blue-100/40 p-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-blue-100/50 rounded w-20"></div>
            ))}
          </div>
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b border-blue-100/30 p-4 last:border-b-0">
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100/50 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-blue-100/60 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-blue-100/40 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-blue-100/50 rounded w-16"></div>
              <div className="h-4 bg-blue-100/50 rounded w-20"></div>
              <div className="flex justify-end">
                <div className="h-6 bg-blue-100/50 rounded-full w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex justify-center items-center mt-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">{label}</p>
        </div>
      </div>
    </div>
  )
}
