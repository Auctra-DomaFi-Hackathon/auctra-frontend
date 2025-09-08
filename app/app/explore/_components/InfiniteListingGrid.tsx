"use client";

import { useState, useCallback, useMemo } from "react";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";
import LazyListingCard from "./LazyListingCard";
import BidDialog from "@/components/auction/BidDialog";
import AuctionDetailsDialog from "@/components/auction/AuctionDetailsDialog";
import { useInfiniteScroll } from "@/hooks/useLazyLoading";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Manual load more handler
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    // Simulate button click on the loadMoreRef element to trigger loading
    const loadMoreElement = document.querySelector('[data-load-more-trigger]') as HTMLElement;
    if (loadMoreElement) {
      // Trigger intersection observer manually
      const currentPage = Math.ceil(listings.length / 6) + 1;
      try {
        await fetchListings(currentPage);
      } catch (error) {
        console.error('Failed to load more listings:', error);
      }
    }
    setIsLoadingMore(false);
  }, [fetchListings, listings.length, hasMore, isLoadingMore]);

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

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center items-center py-8">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore || loading}
            variant="outline"
            className="px-8 py-2 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
          >
            {isLoadingMore || loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <span>Load More ({listings.length} shown)</span>
            )}
          </Button>
        </div>
      )}

      {/* Hidden trigger for infinite scroll hook compatibility */}
      <div
        ref={loadMoreRef}
        data-load-more-trigger
        className="h-1 opacity-0 pointer-events-none"
        aria-hidden="true"
      />

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
