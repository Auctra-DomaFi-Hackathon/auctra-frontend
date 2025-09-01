import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="h-9 bg-gray-200 rounded-lg animate-pulse mb-2 w-96"></div>
        <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-80"></div>
      </div>

      <div className="mb-8">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
          <div className="w-4 h-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
          <div className="w-4 h-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-80 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-28"></div>
                </div>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-36"></div>
                </div>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-18"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-30"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-36"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                </div>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-36"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
      </div>
    </div>
  );
}