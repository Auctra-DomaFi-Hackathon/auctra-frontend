import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({ }: LoadingStateProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 pt-20 sm:pt-30 max-w-4xl">
      {/* Header Section */}
      <header className="mb-6 sm:mb-8">
        <div className="h-8 sm:h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-64 sm:w-80"></div>
        <div className="h-5 sm:h-6 bg-gray-200 rounded-lg animate-pulse w-80 sm:w-96"></div>
      </header>

      {/* Stepper Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
          {/* Step 1 */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-200 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div>
            <div className="hidden sm:block w-8 sm:w-12 h-px bg-gray-200 animate-pulse"></div>
          </div>
          
          {/* Step 2 */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-10 sm:w-12 animate-pulse"></div>
            <div className="hidden sm:block w-8 sm:w-12 h-px bg-gray-200 animate-pulse"></div>
          </div>
          
          {/* Step 3 */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-14 sm:w-16 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-blue-100">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Card Title */}
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-36 sm:w-48"></div>
            
            {/* Domain Input Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-24 sm:w-32"></div>
              <div className="h-10 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-64 sm:w-80"></div>
            </div>
            
            {/* Domain Selection Grid */}
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-32 sm:w-40"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 border rounded-lg space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 space-y-1 sm:space-y-2">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-20 sm:w-24"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
                      </div>
                    </div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-28 sm:w-36"></div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32 sm:w-40"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20 sm:w-24"></div>
                    <div className="h-8 sm:h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24 sm:w-28"></div>
                    <div className="h-8 sm:h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-100">
              <div className="h-9 sm:h-10 bg-gray-200 rounded animate-pulse w-full sm:w-20"></div>
              <div className="h-9 sm:h-10 bg-blue-200 rounded animate-pulse w-full sm:w-16"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Loading Hints */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-48 sm:w-64 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-32 sm:w-40 mx-auto"></div>
      </div>
    </div>
  );
}