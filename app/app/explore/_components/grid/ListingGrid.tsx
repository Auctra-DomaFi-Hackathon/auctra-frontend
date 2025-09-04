"use client";

import { useState } from "react";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";
import { formatEther } from "ethers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExplorePagination } from "../ExplorePagination";
import { getStrategyName } from "@/lib/utils/strategy";
import BidDialog from "@/components/auction/BidDialog";
import Image from "next/image";

interface ListingWithMetadata extends Listing {
  metadata?: NFTMetadata;
}

export default function ListingGrid({
  listings,
  emptyLabel,
  currentPage,
  totalPages,
  onPageChange,
}: {
  listings: ListingWithMetadata[];
  emptyLabel: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const [selectedListing, setSelectedListing] =
    useState<ListingWithMetadata | null>(null);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);

  const handlePlaceBid = (listing: ListingWithMetadata) => {
    setSelectedListing(listing);
    setIsBidDialogOpen(true);
  };

  // Debug pagination props
  console.log('📋 ListingGrid render:', { 
    listingsCount: listings.length, 
    currentPage, 
    totalPages,
    onPageChange: !!onPageChange
  });
  if (!listings.length) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">{emptyLabel}</p>
      </div>
    );
  }

  const formatPrice = (priceWei: string) => {
    try {
      // Get the full ETH value without parseFloat to avoid precision loss
      const fullEthValue = formatEther(priceWei);
      const ethNumber = parseFloat(fullEthValue);

      // If the original Wei value is non-zero but parseFloat gives 0, use full precision
      if (ethNumber === 0 && priceWei !== "0") {
        return `${fullEthValue} ETH`;
      }

      // For very small values (less than 0.001), show more precision
      if (ethNumber > 0 && ethNumber < 0.001) {
        return `${parseFloat(fullEthValue).toFixed(6)} ETH`;
      }

      // For normal values, use standard formatting
      return `${ethNumber.toLocaleString()} ETH`;
    } catch {
      return `${priceWei} wei`;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {listing.metadata?.name ||
                      `Token #${listing.tokenId.slice(-8)}`}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {listing.metadata?.tld || ".eth"}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30"
                >
                  {listing.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seller: {formatAddress(listing.seller)}
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reserve Price:
                </span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {formatPrice(listing.reservePrice)}
                  <Image
                    src="/images/LogoCoin/eth-logo.svg"
                    alt="ETH"
                    width={20}
                    height={12}
                    className="rounded-full inline-block ml-2 mb-1"
                  />
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Strategy:
                </span>
                <Badge
                  variant={listing.strategy ? "default" : "outline"}
                  className={
                    listing.strategy
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600"
                      : "text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                  }
                >
                  {getStrategyName(listing.strategy)}
                </Badge>
              </div>

              {listing.metadata?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {listing.metadata.description}
                </p>
              )}

              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Expires at:{" "}
                  {listing.metadata?.expiresAt
                    ? new Date(listing.metadata.expiresAt * 1000).toLocaleDateString()
                    : 'Unknown'}
                </span>
                <span>Token ID: {listing.tokenId.slice(0, 8)}...</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                {/* {listing.paymentToken ===
                "0x0000000000000000000000000000000000000000" ? (
                  <span className="font-bold text-blue-800 dark:text-blue-400">
                    Payment: ETH 
                  </span>
                ) : (
                  <span>Payment: {formatAddress(listing.paymentToken)}</span>
                )} */}
                <span className="font-bold text-blue-800 dark:text-blue-400">
                  Chain
                </span>

                <div className="flex items-center gap-1">
                  <Image
                    src="/images/logo/domaLogo.svg"
                    alt="Doma Chain"
                    width={50}
                    height={20}
                    className="rounded-sm"
                  />
                </div>
              </div>

              {/* Place Bid Button */}
              <div className="pt-2">
                <Button
                  onClick={() => handlePlaceBid(listing)}
                  disabled={
                    !listing.strategy ||
                    listing.strategy ===
                      "0x0000000000000000000000000000000000000000"
                  }
                  className="w-full"
                  size="sm"
                >
                  {getStrategyName(listing.strategy) === "Dutch Auction"
                    ? "Buy Now"
                    : getStrategyName(listing.strategy) === "Sealed Bid Auction"
                    ? "Commit Bid"
                    : "Place Bid"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && currentPage && onPageChange && (
        <ExplorePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-8"
        />
      )}

      {/* Bid Dialog */}
      <BidDialog
        isOpen={isBidDialogOpen}
        onClose={() => {
          setIsBidDialogOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
      />
    </>
  );
}
