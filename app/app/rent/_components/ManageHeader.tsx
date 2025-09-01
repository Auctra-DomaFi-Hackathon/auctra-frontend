"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useManageRentals } from "@/lib/rental/hooks";
import { formatUSD } from "@/lib/rental/format";

export default function ManageHeader() {
  const { stats, loading } = useManageRentals();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white rounded-2xl shadow-sm border border-blue-100">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Listings",
      value: stats.totalListings,
      color: "text-gray-900",
    },
    {
      label: "Active Listings",
      value: stats.activeListings,
      color: "text-blue-600",
    },
    {
      label: "Currently Rented",
      value: stats.rentedListings,
      color: "text-green-600",
    },
    {
      label: "Deposits Locked",
      value: formatUSD(stats.totalDepositsLocked),
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white rounded-2xl shadow-sm border border-blue-100">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">
              {kpi.label}
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>
              {kpi.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}