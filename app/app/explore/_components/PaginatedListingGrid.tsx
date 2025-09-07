"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";
import LazyListingCard from "./LazyListingCard";
import BidDialog from "@/components/auction/BidDialog";
import AuctionDetailsDialog from "@/components/auction/AuctionDetailsDialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListingWithMetadata extends Listing {
  metadata?: NFTMetadata;
}

interface PaginatedListingGridProps {
  allListings: ListingWithMetadata[];
  emptyLabel: string;
  currentPrices?: { [listingId: string]: string };
  auctionTimes?: {
    [listingId: string]: { startTime: number; endTime: number };
  };
  cacheKey: string;
}

export default function PaginatedListingGrid({
  allListings,
  emptyLabel,
  currentPrices = {},
  auctionTimes = {},
  cacheKey,
}: PaginatedListingGridProps) {
  const [selectedListing, setSelectedListing] =
    useState<ListingWithMetadata | null>(null);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 6;
  
  // Reset to first page when listings change (filters applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [cacheKey, allListings.length]);

  // Calculate pagination
  const totalItems = allListings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentListings = allListings.slice(0, endIndex); // Show all items up to current page
  const hasMore = currentPage < totalPages;

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

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  }, [isLoading, hasMore]);

  // Memoize listing cards to prevent unnecessary re-renders
  const listingCards = useMemo(
    () =>
      currentListings.map((listing: any, index: any) => (
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
    [currentListings, currentPrices, auctionTimes, handlePlaceBid, handleViewDetails]
  );

  // Show empty state
  if (totalItems === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-10 text-center text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        {emptyLabel}
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
            disabled={isLoading}
            variant="outline"
            className="px-8 py-3 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <span className="text-blue-600">Load More ({currentListings.length} of {totalItems})</span>
            )}
          </Button>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && currentListings.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            All {totalItems} listings shown
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