'use client'

export default function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}
    