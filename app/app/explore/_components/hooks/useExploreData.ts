"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { auctionsService, domainsService } from "@/lib/services";
import type { Auction, Domain } from "@/types";
import { useDebounce } from "./useDebounce";
import { useActiveListings } from "@/lib/graphql/hooks";
import { formatEther } from "ethers";
import { getStrategyName } from "@/lib/utils/strategy";
import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/hooks/contracts/constants";
import { DOMAIN_AUCTION_HOUSE_ABI } from "@/hooks/contracts/abis";

export type StatusTab = "liquidation" | "listings";
type SortKey = "ending-soon" | "newest" | "price-low" | "price-high";

export function useExploreData() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrices, setCurrentPrices] = useState<{
    [listingId: string]: string;
  }>({});
  const [auctionTimes, setAuctionTimes] = useState<{
    [listingId: string]: { startTime: number; endTime: number };
  }>({});

  const publicClient = usePublicClient();

  // auction pagination
  const [currentPage, setCurrentPage] = useState<Record<StatusTab, number>>({
    liquidation: 1,
    listings: 1,
  });
  const itemsPerPage = 6;

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const q = useDebounce(searchQuery, 250);
  const [selectedTLDs, setSelectedTLDs] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // lowercased
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("ending-soon");
  const [tab, setTab] = useState<StatusTab>("listings");

  // Fetch active listings from GraphQL with pagination
  const {
    listings,
    loading: listingsLoading,
    error: listingsError,
    currentPage: listingsPage,
    totalPages: listingsTotalPages,
    totalCount: listingsTotalCount,
    onPageChange: onListingsPageChange,
  } = useActiveListings(6);

  // load data progressively
  useEffect(() => {
    const load = async () => {
      try {
        // Load UI first, then data progressively
        setLoading(false);

        // Load domains first (lighter)
        const d = await domainsService.getAll();
        setDomains(d);

        // Then load auctions
        const a = await auctionsService.getAll();
        setAuctions(a);
      } catch (e) {
        console.error("Failed to load data:", e);
        setLoading(false);
      }
    };
    load();
  }, []);

  // helpers
  const domainById = useMemo(() => {
    const m = new Map<string, Domain>();
    domains.forEach((d) => m.set(d.id, d));
    return m;
  }, [domains]);

  const tlds = useMemo(() => {
    // Collect TLDs from both domains and listings metadata
    const domainTlds = domains.map((d) => d.tld);
    const listingTlds = (listings || [])
      .map((listing) => listing.metadata?.tld)
      .filter((tld): tld is string => Boolean(tld));

    return Array.from(new Set([...domainTlds, ...listingTlds])).sort();
  }, [domains, listings]);
  const auctionTypes = ["Dutch", "Sealed Bid", "English"] as const;

  const applyStatus = (a: Auction, status: StatusTab) => {
    if (status === "liquidation")
      return (a.type || "").toLowerCase() === "liquidation";
    return true;
  };

  const byStatus = useMemo(() => {
    function applyFilters(list: Auction[]) {
      let out = list;

      if (q) {
        const ql = q.toLowerCase();
        out = out.filter((a) =>
          domainById.get(a.domainId)?.name.toLowerCase().includes(ql)
        );
      }
      if (selectedTLDs.length) {
        out = out.filter((a) => {
          const d = domainById.get(a.domainId);
          return d && d.tld && selectedTLDs.includes(d.tld);
        });
      }
      if (selectedTypes.length) {
        out = out.filter((a) =>
          selectedTypes.includes((a.type || "").toLowerCase())
        );
      }
      if (priceMin || priceMax) {
        const min = priceMin ? parseFloat(priceMin) : 0;
        const max = priceMax ? parseFloat(priceMax) : Number.POSITIVE_INFINITY;
        out = out.filter((a) => {
          // For auctions, use a simple fallback price logic
          const price = a.parameters?.sealed?.minDepositUsd || 0;
          return price >= min && price <= max;
        });
      }
      return out;
    }

    function applySort(list: Auction[]) {
      const copy = [...list];
      const priceOf = (x: Auction) => x.parameters?.sealed?.minDepositUsd || 0;

      if (sortBy === "ending-soon")
        copy.sort((a, b) => +new Date(a.endTime) - +new Date(b.endTime));
      else if (sortBy === "newest")
        copy.sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
      else if (sortBy === "price-low")
        copy.sort((a, b) => priceOf(a) - priceOf(b));
      else if (sortBy === "price-high")
        copy.sort((a, b) => priceOf(b) - priceOf(a));
      return copy;
    }

    const base: Record<StatusTab, Auction[]> = {
      liquidation: [],
      listings: [],
    };
    auctions.forEach((a) => {
      (["liquidation"] as StatusTab[]).forEach((s) => {
        if (applyStatus(a, s)) base[s].push(a);
      });
    });

    // Apply pagination to auction results
    const paginate = <T>(
      items: T[],
      page: number
    ): { items: T[]; totalPages: number } => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return {
        items: items.slice(startIndex, endIndex),
        totalPages: Math.ceil(items.length / itemsPerPage),
      };
    };

    const liquidationFiltered = applySort(applyFilters(base.liquidation));

    return {
      liquidation: paginate(liquidationFiltered, currentPage.liquidation),
      liquidationTotal: liquidationFiltered.length,
    };
  }, [
    auctions,
    q,
    selectedTLDs,
    selectedTypes,
    priceMin,
    priceMax,
    sortBy,
    domainById,
    currentPage,
  ]);

  // Filter listings similar to how auctions are filtered
  const filteredListings = useMemo(() => {
    // Don't filter if still loading - return empty to avoid false data
    if (listingsLoading) {
      console.log("🗺 Still loading listings, returning empty array");
      return [];
    }

    // If no listings available, return empty
    if (!listings || listings.length === 0) {
      console.log("🗺 No listings available");
      return [];
    }

    let filtered = listings;

    // Apply search query filter
    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter((listing) => {
        // Search in domain name from metadata
        const domainName = listing.metadata?.name?.toLowerCase() || "";
        return domainName.includes(ql);
      });
    }

    // Apply TLD filter
    if (selectedTLDs.length) {
      filtered = filtered.filter((listing) => {
        const tld = listing.metadata?.tld || "";
        return selectedTLDs.includes(tld);
      });
    }

    // Apply auction type filter
    if (selectedTypes.length) {
      filtered = filtered.filter((listing) => {
        const strategyName = getStrategyName(listing.strategy);

        // Map strategy names to match auction type filter format
        // selectedTypes contains lowercase versions like ['dutch', 'sealed bid', 'english']
        // strategyName contains full names like 'Dutch Auction', 'English Auction', 'Sealed Bid Auction'
        if (strategyName.includes("Dutch") && selectedTypes.includes("dutch")) {
          return true;
        } else if (
          strategyName.includes("English") &&
          selectedTypes.includes("english")
        ) {
          return true;
        } else if (
          strategyName.includes("Sealed") &&
          selectedTypes.includes("sealed bid")
        ) {
          return true;
        }

        return false;
      });
    }

    // Apply price filter
    if (priceMin || priceMax) {
      const min = priceMin ? parseFloat(priceMin) : 0;
      const max = priceMax ? parseFloat(priceMax) : Number.POSITIVE_INFINITY;
      filtered = filtered.filter((listing) => {
        try {
          const priceEth = parseFloat(formatEther(listing.reservePrice));
          return priceEth >= min && priceEth <= max;
        } catch {
          return true; // Keep if price parsing fails
        }
      });
    }

    // Apply sorting
    const sortedFiltered = [...filtered];
    if (sortBy === "newest") {
      sortedFiltered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "price-low") {
      sortedFiltered.sort((a, b) => {
        try {
          const priceA = parseFloat(formatEther(a.reservePrice));
          const priceB = parseFloat(formatEther(b.reservePrice));
          return priceA - priceB;
        } catch {
          return 0;
        }
      });
    } else if (sortBy === "price-high") {
      sortedFiltered.sort((a, b) => {
        try {
          const priceA = parseFloat(formatEther(a.reservePrice));
          const priceB = parseFloat(formatEther(b.reservePrice));
          return priceB - priceA;
        } catch {
          return 0;
        }
      });
    }

    const result = sortedFiltered;
    console.log("🔎 Filtered result:", { resultCount: result.length });
    return result;
  }, [
    listings,
    q,
    selectedTLDs,
    selectedTypes,
    priceMin,
    priceMax,
    sortBy,
    listingsLoading,
    listingsError,
  ]);

  const counts = {
    liquidation: byStatus.liquidationTotal || 0,
    listings: listingsTotalCount || 0,
  };

  // togglers
  const toggleTLD = (tld: string, checked: boolean) =>
    setSelectedTLDs((prev) =>
      checked ? [...prev, tld] : prev.filter((x) => x !== tld)
    );

  const toggleType = (type: string, checked: boolean) => {
    const key = type.toLowerCase();
    setSelectedTypes((prev) =>
      checked ? [...prev, key] : prev.filter((x) => x !== key)
    );
  };

  // Page change functions for auctions
  const onAuctionPageChange = (status: StatusTab, page: number) => {
    setCurrentPage((prev) => ({ ...prev, [status]: page }));
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage({ liquidation: 1, listings: 1 });
  }, [q, selectedTLDs, selectedTypes, priceMin, priceMax, sortBy]);

  // Fetch current prices and auction times for Dutch auctions
  useEffect(() => {
    const fetchAuctionData = async () => {
      if (!publicClient || !filteredListings.length) return;

      // Fetch current prices for Dutch auctions
      const dutchListings = filteredListings.filter(
        (l) => getStrategyName(l.strategy) === "Dutch Auction"
      );

      const pricePromises = dutchListings.map(async (listing) => {
        try {
          const currentPriceWei = (await publicClient.readContract({
            address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
            abi: DOMAIN_AUCTION_HOUSE_ABI,
            functionName: "previewCurrentPrice",
            args: [BigInt(listing.id)],
          })) as bigint;

          return { listingId: listing.id, price: currentPriceWei.toString() };
        } catch {
          return { listingId: listing.id, price: listing.reservePrice };
        }
      });

      const priceResults = await Promise.allSettled(pricePromises);
      const newPrices: { [listingId: string]: string } = {};

      priceResults.forEach((r) => {
        if (r.status === "fulfilled") {
          const { listingId, price } = r.value;
          newPrices[listingId] = price;
        }
      });

      setCurrentPrices(newPrices);

      // Fetch auction start and end times
      const timePromises = filteredListings
        .slice(0, 20)
        .map(async (listing) => {
          // Limit to first 20 for performance
          try {
            const data = (await publicClient.readContract({
              address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
              abi: DOMAIN_AUCTION_HOUSE_ABI,
              functionName: "listings",
              args: [BigInt(listing.id)],
            })) as readonly any[];

            const startTime = Number(data[5]);
            const endTime = Number(data[6]);

            return { listingId: listing.id, startTime, endTime };
          } catch {
            return null;
          }
        });

      const timeResults = await Promise.allSettled(timePromises);
      const newTimes: {
        [listingId: string]: { startTime: number; endTime: number };
      } = {};

      timeResults.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          const { listingId, startTime, endTime } = r.value;
          newTimes[listingId] = { startTime, endTime };
        }
      });

      setAuctionTimes(newTimes);
    };

    fetchAuctionData();
  }, [publicClient, filteredListings]);

  // Create fetchMoreListings function for pagination with 6 items per page
  const fetchMoreListings = useCallback(
    async (page: number) => {
      console.log(
        "📦 fetchMoreListings called with page:",
        page,
        "total filtered listings:",
        filteredListings.length
      );

      const itemsPerPage = 6; // Start with 6 items as default
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      const items = filteredListings.slice(startIndex, endIndex);
      const hasMore = endIndex < filteredListings.length;
      const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

      console.log("📦 fetchMoreListings returning:", {
        page,
        itemsLength: items.length,
        hasMore,
        totalPages,
        startIndex,
        endIndex,
        totalFilteredListings: filteredListings.length,
      });

      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        items,
        hasMore,
        totalPages,
      };
    },
    [filteredListings]
  );

  return {
    loading: loading || listingsLoading,
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    tlds,
    auctionTypes,
    selectedTLDs,
    toggleTLD,
    selectedTypes,
    toggleType,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    sortBy,
    setSortBy,
    byStatus,
    counts,
    domainById,
    listings: filteredListings,
    listingsError,
    listingsPage,
    listingsTotalPages,
    onListingsPageChange,
    onAuctionPageChange,
    currentPage,
    // New infinite scroll additions
    fetchMoreListings,
    currentPrices,
    auctionTimes,
    // Add metadata loading state
    isDataReady: !listingsLoading && !!listings && listings.length >= 0,
  };
}
