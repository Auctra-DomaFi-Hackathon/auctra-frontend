"use client";

import { useState, useCallback, useMemo } from "react";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";
import LazyListingCard from "./LazyListingCard";
import BidDialog from "@/components/auction/BidDialog";
import AuctionDetailsDialog from "@/components/auction/AuctionDetailsDialog";
import { useInfiniteScroll } from "@/hooks/useLazyLoading";
import { Loader2 } from "lucide-react";

interface ListingWithMetadata extends Listing {
  metadata?: NFTMetadata;
}

interface InfiniteListingGridProps {
  fetchListings: (page: number) => Promise<{
    items: ListingWithMetadata[];
    hasMore: boolean;
    totalPages: number;
  }>;
  emptyLabel: string;
  currentPrices?: { [listingId: string]: string };
  auctionTimes?: {
    [listingId: string]: { startTime: number; endTime: number };
  };
  cacheKey: string;
}

export default function InfiniteListingGrid({
  fetchListings,
  emptyLabel,
  currentPrices = {},
  auctionTimes = {},
  cacheKey,
}: InfiniteListingGridProps) {
  const [selectedListing, setSelectedListing] =
    useState<ListingWithMetadata | null>(null);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string>("");

  // Use infinite scroll hook
  const {
    data: listings,
    loading,
    hasMore,
    loadMoreRef,
  } = useInfiniteScroll<ListingWithMetadata>(cacheKey, fetchListings);

  console.log('🎯 InfiniteListingGrid render:', {
    cacheKey,
    listingsCount: listings.length,
    loading,
    hasMore,
    fetchListingsType: typeof fetchListings
  })

  const handlePlaceBid = useCallback((listing: ListingWithMetadata) => {
    setSelectedListing(listing);
    setIsBidDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((listing: ListingWithMetadata) => {
    setSelectedListingId(listing.id);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleCloseBidDialog = useCallback(() => {
    setIsBidDialogOpen(false);
    setSelectedListing(null);
  }, []);

  const handleCloseDetailsDialog = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setSelectedListingId("");
  }, []);

  // Memoize listing cards to prevent unnecessary re-renders
  const listingCards = useMemo(
    () =>
      listings.map((listing: any, index: any) => (
        <LazyListingCard
          key={listing.id}
          listing={listing}
          currentPrice={currentPrices[listing.id]}
          auctionTime={auctionTimes[listing.id]}
          onPlaceBid={handlePlaceBid}
          onViewDetails={handleViewDetails}
          index={index}
        />
      )),
    [listings, currentPrices, auctionTimes, handlePlaceBid, handleViewDetails]
  );

  // Show error state
  // Show empty state
  if (!loading && listings.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-10 text-center text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        {emptyLabel}
      </div>
    );
  }

  // Show initial loading state
  if (loading && listings.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[400px] rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listingCards}
      </div>

      {/* Loading more indicator */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center items-center py-8"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more listings...</span>
            </div>
          ) : (
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Scroll to load more ({listings.length} shown)
            </div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && listings.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            No more listings to show ({listings.length} total)
          </div>
        </div>
      )}

      {/* Dialogs */}
      <BidDialog
        isOpen={isBidDialogOpen}
        onClose={handleCloseBidDialog}
        listing={selectedListing}
      />

      <AuctionDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        listingId={selectedListingId}
      />
    </>
  );
}
