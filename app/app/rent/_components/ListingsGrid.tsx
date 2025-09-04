"use client";

import { useExploreRentals } from "@/lib/rental/hooks";
import ListingCard from "./ListingCard";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

export default function ListingsGrid() {
  const { listings, loading, error } = useExploreRentals();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center dark:bg-gray-800 dark:border-red-800">
        <div className="text-red-600 mb-2 dark:text-red-400">⚠️ Error</div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}