import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function EmptyState() {
  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-blue-100 dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/20">
          <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
          No domains found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto dark:text-gray-400">
          Try adjusting your filters or search terms to find available domains for rent.
        </p>
      </CardContent>
    </Card>
  );
}