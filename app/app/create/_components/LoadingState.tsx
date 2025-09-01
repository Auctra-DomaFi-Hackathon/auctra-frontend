'use client'

export default function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl animate-pulse">
      {/* Header */}
      <header className="mb-8">
        <div className="h-9 bg-blue-100/60 rounded-lg w-64 mb-2"></div>
        <div className="h-6 bg-blue-100/40 rounded w-96"></div>
      </header>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 px-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100/50 border-2 border-blue-100/60"></div>
            <div className="ml-2 h-4 bg-blue-100/40 rounded w-16"></div>
            {index < 4 && (
              <div className="w-16 h-px mx-4 bg-blue-100/40" />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-blue-100/60 p-8">
        <div className="space-y-6">
          {/* Form Title */}
          <div className="h-7 bg-blue-100/50 rounded-lg w-48"></div>
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-blue-100/40 rounded w-24 mb-2"></div>
              <div className="h-12 bg-blue-100/30 rounded-xl w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-blue-100/40 rounded w-32 mb-2"></div>
              <div className="h-12 bg-blue-100/30 rounded-xl w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-blue-100/40 rounded w-28 mb-2"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-blue-100/30 rounded-xl"></div>
                <div className="h-12 bg-blue-100/30 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Description area */}
          <div className="space-y-2">
            <div className="h-4 bg-blue-100/40 rounded w-full"></div>
            <div className="h-4 bg-blue-100/30 rounded w-4/5"></div>
            <div className="h-4 bg-blue-100/30 rounded w-3/5"></div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-4">
            <div className="h-10 bg-blue-100/40 rounded-lg w-24"></div>
            <div className="h-10 bg-blue-200/60 rounded-lg w-32"></div>
          </div>
        </div>
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
