'use client'

export default function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full min-h-[400px] md:min-h-[450px] rounded-2xl border border-blue-100/80 bg-white animate-pulse">
          {/* Header */}
          <div className="p-6 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="h-6 bg-blue-100/60 rounded-lg mb-3 w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-blue-100/50 rounded-full w-20"></div>
                  <div className="h-5 bg-blue-100/50 rounded-full w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-3 bg-blue-100/40 rounded w-20 mb-1"></div>
                <div className="h-5 bg-blue-100/50 rounded w-12"></div>
              </div>
            </div>
          </div>
          
          {/* Body */}
          <div className="px-6 pb-6 space-y-4">
            {/* Price block */}
            <div className="rounded-xl border border-blue-100/80 bg-blue-50/35 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="h-3 bg-blue-100/60 rounded w-20 mb-2"></div>
                  <div className="h-7 bg-blue-200/60 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-3 bg-blue-100/60 rounded w-12 mb-2 ml-auto"></div>
                  <div className="h-5 bg-blue-100/50 rounded w-16 ml-auto"></div>
                </div>
              </div>
            </div>
            
            {/* Countdown area */}
            <div className="rounded-xl border border-blue-200/60 bg-blue-50/30 p-4">
              <div className="h-4 bg-blue-100/50 rounded w-32 mx-auto mb-3"></div>
              <div className="h-8 bg-blue-200/50 rounded-lg"></div>
            </div>
            
            {/* Oracle info */}
            <div className="h-4 bg-blue-100/40 rounded w-full"></div>
            
            {/* Button */}
            <div className="h-10 bg-blue-200/50 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
