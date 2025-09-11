"use client";

import { useActiveRentalListings } from "@/lib/graphql/hooks";
import { RentalListingWithMetadata } from "@/lib/graphql/types";
import { ListingWithMeta, ExploreFilters } from "@/lib/rental/types";
import ListingCard from "./ListingCard";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import { ExplorePagination } from "../../explore/_components/ExplorePagination";
import { useRentalFilters } from "@/lib/rental/filterContext";
import { useMemo } from "react";
import Link from "next/link";

// Adapter function to convert GraphQL rental listing to expected format
const adaptRentalListingToListingWithMeta = (
  rentalListing: RentalListingWithMetadata
): ListingWithMeta => {
  // Get domain expiration date from metadata (already fetched by useActiveRentalListings hook)
  const expiresAt = rentalListing.metadata?.expiresAt ?? 0;
  // Safe BigInt conversion with fallback
  const safeBigInt = (value: string | number | undefined, fallback = "0") => {
    try {
      if (!value) return BigInt(fallback);
      return BigInt(value);
    } catch (error) {
      console.error("Failed to convert to BigInt:", value, error);
      return BigInt(fallback);
    }
  };

  console.log("🔄 Adapter processing listing:", {
    tokenId: rentalListing.tokenId,
    domain: rentalListing.metadata?.name,
    rawMetadata: rentalListing.metadata,
    pricePerDay: rentalListing.pricePerDay,
    securityDeposit: rentalListing.securityDeposit,
    minDays: rentalListing.minDays,
    maxDays: rentalListing.maxDays,
    expiresAt,
    expiresDate: expiresAt
      ? new Date(expiresAt * 1000).toLocaleString()
      : "Unknown",
  });
  
  // Log the converted BigInt values
  const convertedPricePerDay = safeBigInt(rentalListing.pricePerDay);
  const convertedSecurityDeposit = safeBigInt(rentalListing.securityDeposit);
  
  console.log("💰 Price conversion check:", {
    rawPricePerDay: rentalListing.pricePerDay,
    convertedPricePerDay: convertedPricePerDay.toString(),
    rawSecurityDeposit: rentalListing.securityDeposit,
    convertedSecurityDeposit: convertedSecurityDeposit.toString(),
    priceInUSDC: Number(convertedPricePerDay) / 1_000_000,
    depositInUSDC: Number(convertedSecurityDeposit) / 1_000_000,
  });

  return {
    id: parseInt(rentalListing.id),
    domain:
      rentalListing.metadata?.name ||
      `Domain-${rentalListing.tokenId.slice(-8)}`,
    tld: rentalListing.metadata?.tld || ".eth",
    verified: false,
    expiresAt, // Get domain expiry from metadata
    listing: {
      nft: rentalListing.nft as `0x${string}`,
      tokenId: safeBigInt(rentalListing.tokenId),
      owner: rentalListing.owner as `0x${string}`,
      paymentToken: rentalListing.paymentToken as `0x${string}`,
      pricePerDay: convertedPricePerDay,
      securityDeposit: convertedSecurityDeposit,
      minDays: rentalListing.minDays || 0,
      maxDays: rentalListing.maxDays || 0,
      paused: rentalListing.paused || false,
    },
    rental: null, // We don't have current rental info in this query
  };
};

export default function ListingsGrid() {
  const {
    rentalListings,
    loading,
    error,
    currentPage,
    totalPages,
    onPageChange,
  } = useActiveRentalListings(6);
  const { filters } = useRentalFilters();

  // Convert GraphQL rental listings to the expected format
  const adaptedListings = rentalListings.map(
    adaptRentalListingToListingWithMeta
  );

  // Apply filters to the adapted listings
  const filteredListings = useMemo(() => {
    // First filter out listings with 0 pricing (failsafe)
    let filtered = adaptedListings.filter((item) => 
      Number(item.listing.pricePerDay) > 0 && 
      item.listing.minDays > 0 && 
      item.listing.maxDays > 0
    );

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((item) =>
        item.domain.toLowerCase().includes(search)
      );
    }

    // Apply TLD filter
    if (filters.tld) {
      filtered = filtered.filter((item) => item.tld === filters.tld);
    }

    // Apply price filters (prices are in USDC with 6 decimals)
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((item) => {
        try {
          const priceUSDC = Number(item.listing.pricePerDay) / 1_000_000; // Convert from 6-decimal USDC to dollars
          return priceUSDC >= filters.minPrice!;
        } catch {
          return true;
        }
      });
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((item) => {
        try {
          const priceUSDC = Number(item.listing.pricePerDay) / 1_000_000; // Convert from 6-decimal USDC to dollars
          return priceUSDC <= filters.maxPrice!;
        } catch {
          return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (filters.sort) {
        case "price":
          try {
            aValue = Number(a.listing.pricePerDay) / 1_000_000; // Convert from 6-decimal USDC to dollars
            bValue = Number(b.listing.pricePerDay) / 1_000_000; // Convert from 6-decimal USDC to dollars
          } catch {
            aValue = 0;
            bValue = 0;
          }
          break;
        case "expiry":
          aValue = a.expiresAt;
          bValue = b.expiresAt;
          break;
        case "domain":
        default:
          aValue = a.domain;
          bValue = b.domain;
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return filters.sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = Number(aValue);
      const numB = Number(bValue);
      return filters.sortOrder === "asc" ? numA - numB : numB - numA;
    });

    return filtered;
  }, [adaptedListings, filters]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center dark:bg-gray-800 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 mb-4 font-bold">
          *Must run in Localhost. Please check this repository to run locally
          with frontend and indexer.
        </p>
        <Link
          href="https://github.com/Auctra-DomaFi-Hackathon"
          target="_blank"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Visit Repository
        </Link>
        {/* <p className="text-gray-600 dark:text-gray-400">
          {typeof error === "string"
            ? error
            : error instanceof Error
            ? error.message
            : "An unknown error occurred"}
        </p> */}
      </div>
    );
  }

  if (filteredListings.length === 0 && !loading) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
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
    </>
  );
}
