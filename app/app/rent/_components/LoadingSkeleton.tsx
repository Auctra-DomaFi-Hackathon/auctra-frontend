import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="bg-white rounded-2xl shadow-sm border border-blue-100">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3 mb-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>

            {/* Domain Expiry */}
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mb-4"></div>

            {/* Payment Token */}
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}