"use client";

import { useActiveRentalListings } from "@/lib/graphql/hooks";
import { RentalListingWithMetadata } from "@/lib/graphql/types";
import { ListingWithMeta } from "@/lib/rental/types";
import ListingCard from "./ListingCard";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

// Adapter function to convert GraphQL rental listing to expected format
const adaptRentalListingToListingWithMeta = (rentalListing: RentalListingWithMetadata): ListingWithMeta => {
  // Get domain expiration date from metadata (already fetched by useActiveRentalListings hook)
  const expiresAt = rentalListing.metadata?.expiresAt ?? 0;
  console.log('🔄 Adapter processing listing:', {
    tokenId: rentalListing.tokenId,
    domain: rentalListing.metadata?.name,
    rawMetadata: rentalListing.metadata,
    expiresAt,
    expiresDate: expiresAt ? new Date(expiresAt * 1000).toLocaleString() : 'Unknown'
  });
  
  return {
    id: parseInt(rentalListing.id),
    domain: rentalListing.metadata?.name || `Domain-${rentalListing.tokenId.slice(-8)}`,
    tld: rentalListing.metadata?.tld || '.eth',
    verified: false,
    expiresAt, // Get domain expiry from metadata
    listing: {
      nft: rentalListing.nft as `0x${string}`,
      tokenId: BigInt(rentalListing.tokenId),
      owner: rentalListing.owner as `0x${string}`,
      paymentToken: rentalListing.paymentToken as `0x${string}`,
      pricePerDay: BigInt(rentalListing.pricePerDay),
      securityDeposit: BigInt(rentalListing.securityDeposit),
      minDays: rentalListing.minDays,
      maxDays: rentalListing.maxDays,
      paused: rentalListing.paused,
    },
    rental: null, // We don't have current rental info in this query
  };
};

export default function ListingsGrid() {
  const { rentalListings, loading, error } = useActiveRentalListings(50);

  // Convert GraphQL rental listings to the expected format
  const adaptedListings = rentalListings.map(adaptRentalListingToListingWithMeta);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center dark:bg-gray-800 dark:border-red-800">
        <div className="text-red-600 mb-2 dark:text-red-400">⚠️ Error</div>
        <p className="text-gray-600 dark:text-gray-400">{typeof error === 'string' ? error : error instanceof Error ? error.message : 'An unknown error occurred'}</p>
      </div>
    );
  }

  if (adaptedListings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {adaptedListings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}