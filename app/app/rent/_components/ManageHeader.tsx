"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRentalListingsByOwner, useUserRentalHistory } from "@/lib/graphql/hooks";
import { formatUSD } from "@/lib/rental/format";
import { useAccount } from "wagmi";
import { useMemo } from "react";

export default function ManageHeader() {
  const { address } = useAccount();
  const { rentalListings, loading: listingsLoading } = useRentalListingsByOwner(address, 50);
  const { rentalHistory, loading: historyLoading } = useUserRentalHistory(address, 50);
  
  const loading = listingsLoading || historyLoading;

  // Calculate statistics from real data
  const stats = useMemo(() => {
    const totalListings = rentalListings.length;
    
    // Active listings: all listings that are active and not paused
    const activeListings = rentalListings.filter(listing => 
      listing.active && !listing.paused
    ).length;
    
    // Currently rented: Based on the context, this should represent domains the user has rented out
    // Since we don't have current rental status in the listings data, we'll use rental history
    // to approximate domains that have been rented out (this is an approximation)
    const currentlyRented = rentalHistory.filter(rental => 
      rental.eventType.toLowerCase() === 'rented'
    ).length;
    
    // Total deposits locked: sum of all security deposits from active listings
    const totalDepositsLocked = rentalListings
      .filter(listing => listing.active && !listing.paused)
      .reduce((sum, listing) => sum + BigInt(listing.securityDeposit || 0), BigInt(0));

    return {
      totalListings,
      activeListings,
      rentedListings: currentlyRented,
      totalDepositsLocked,
    };
  }, [rentalListings, rentalHistory]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
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
      color: "text-black dark:text-white",
    },
    {
      label: "Active Listings",
      value: stats.activeListings,
      color: "text-black dark:text-white",
    },
    {
      label: "Currently Rented",
      value: stats.rentedListings,
      color: "text-black dark:text-white",
    },
    {
      label: "Deposits Locked",
      value: formatUSD(stats.totalDepositsLocked),
      color: "text-black dark:text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
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