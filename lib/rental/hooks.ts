"use client";

import { useState, useEffect, useMemo } from "react";
import { Address, ExploreFilters, ListingWithMeta } from "./types";
import mockRentalService, { MOCK_ACCOUNTS } from "./mockService";

export function useExploreRentals() {
  const [listings, setListings] = useState<ListingWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExploreFilters>({
    search: "",
    tld: "",
    minPrice: undefined,
    maxPrice: undefined,
    sort: "domain",
    sortOrder: "asc",
  });

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mockRentalService.getAllListings();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings;

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.domain.toLowerCase().includes(search)
      );
    }

    // Apply TLD filter
    if (filters.tld) {
      filtered = filtered.filter(item => item.tld === filters.tld);
    }

    // Apply price filters (convert to dollars for filtering)
    if (filters.minPrice !== undefined) {
      const minPriceUsdc = BigInt(filters.minPrice * 1_000_000);
      filtered = filtered.filter(item => item.listing.pricePerDay >= minPriceUsdc);
    }

    if (filters.maxPrice !== undefined) {
      const maxPriceUsdc = BigInt(filters.maxPrice * 1_000_000);
      filtered = filtered.filter(item => item.listing.pricePerDay <= maxPriceUsdc);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (filters.sort) {
        case "price":
          aValue = Number(a.listing.pricePerDay);
          bValue = Number(b.listing.pricePerDay);
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
  }, [listings, filters]);

  const refetch = () => {
    fetchListings();
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings: filteredAndSortedListings,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  };
}

export function useManageRentals(owner?: Address) {
  const [listings, setListings] = useState<ListingWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use mock owner if none provided
  const ownerAddress = owner || MOCK_ACCOUNTS.owner;

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const allListings = await mockRentalService.getAllListings();
      // Filter by owner
      const myListings = allListings.filter(
        item => item.listing.owner.toLowerCase() === ownerAddress.toLowerCase()
      );
      setListings(myListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  // Action wrappers with optimistic updates and error handling
  const actions = {
    deposit: async (nft: Address, tokenId: bigint) => {
      try {
        const result = await mockRentalService.deposit(nft, tokenId);
        await fetchListings(); // Refresh after success
        return result;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to deposit NFT");
      }
    },

    setTerms: async (
      id: number,
      pricePerDay: bigint,
      securityDeposit: bigint,
      minDays: number,
      maxDays: number,
      paymentToken: Address
    ) => {
      try {
        await mockRentalService.setTerms(id, pricePerDay, securityDeposit, minDays, maxDays, paymentToken);
        await fetchListings(); // Refresh after success
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to set terms");
      }
    },

    pause: async (id: number, value: boolean) => {
      try {
        // Optimistic update
        setListings(prev => prev.map(item =>
          item.id === id ? { ...item, listing: { ...item.listing, paused: value } } : item
        ));
        
        await mockRentalService.pause(id, value);
        await fetchListings(); // Refresh to ensure consistency
      } catch (err) {
        await fetchListings(); // Revert optimistic update on error
        throw new Error(err instanceof Error ? err.message : "Failed to pause/unpause listing");
      }
    },

    unlist: async (id: number) => {
      try {
        await mockRentalService.unlist(id);
        // Remove from local state
        setListings(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to unlist");
      }
    },

    extend: async (id: number, extraDays: number) => {
      try {
        await mockRentalService.extend(id, extraDays);
        await fetchListings(); // Refresh after success
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to extend rental");
      }
    },

    endRent: async (id: number) => {
      try {
        await mockRentalService.endRent(id);
        await fetchListings(); // Refresh after success
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to end rental");
      }
    },

    claimDeposit: async (id: number, to: Address) => {
      try {
        await mockRentalService.claimDeposit(id, to);
        await fetchListings(); // Refresh after success
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to claim deposit");
      }
    },
  };

  const refetch = () => {
    fetchListings();
  };

  useEffect(() => {
    fetchListings();
  }, [ownerAddress]);

  // Compute derived data
  const stats = useMemo(() => {
    const activeListings = listings.filter(item => !item.listing.paused && !item.rental);
    const rentedListings = listings.filter(item => item.rental);
    const totalDepositsLocked = listings
      .filter(item => item.rental)
      .reduce((sum, item) => sum + item.listing.securityDeposit, 0n);

    return {
      totalListings: listings.length,
      activeListings: activeListings.length,
      rentedListings: rentedListings.length,
      totalDepositsLocked,
    };
  }, [listings]);

  return {
    myListings: listings,
    stats,
    loading,
    error,
    actions,
    refetch,
  };
}

export function useRentDomain() {
  const [loading, setLoading] = useState(false);

  const rentDomain = async (id: number, days: number) => {
    try {
      setLoading(true);
      await mockRentalService.rent(id, days);
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to rent domain");
    } finally {
      setLoading(false);
    }
  };

  return {
    rentDomain,
    loading,
  };
}