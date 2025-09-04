'use client'

import { useEffect, useMemo, useState } from 'react'
import { auctionsService, domainsService } from '@/lib/services'
import type { Auction, Domain } from '@/types'
import { useDebounce } from './useDebounce'
import { useActiveListings } from '@/lib/graphql/hooks'
import { formatEther } from 'ethers'
import { getStrategyName } from '@/lib/utils/strategy'

export type StatusTab = 'expiring' | 'ongoing' | 'liquidation' | 'listings'
type SortKey = 'ending-soon' | 'newest' | 'price-low' | 'price-high'

export function useExploreData() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  // auction pagination
  const [currentPage, setCurrentPage] = useState<Record<StatusTab, number>>({expiring: 1, ongoing: 1, liquidation: 1, listings: 1})
  const itemsPerPage = 6

  // filters
  const [searchQuery, setSearchQuery] = useState('')
  const q = useDebounce(searchQuery, 250)
  const [selectedTLDs, setSelectedTLDs] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]) // lowercased
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('ending-soon')
  const [tab, setTab] = useState<StatusTab>('listings')

  // Fetch active listings from GraphQL with pagination
  const { listings, loading: listingsLoading, error: listingsError, currentPage: listingsPage, totalPages: listingsTotalPages, onPageChange: onListingsPageChange } = useActiveListings(6)

  // load data progressively
  useEffect(() => {
    const load = async () => {
      try {
        // Load UI first, then data progressively
        setLoading(false)
        
        // Load domains first (lighter)
        const d = await domainsService.getAll()
        setDomains(d)
        
        // Then load auctions
        const a = await auctionsService.getAll()
        setAuctions(a)
      } catch (e) {
        console.error('Failed to load data:', e)
        setLoading(false)
      }
    }
    load()
  }, [])

  // helpers
  const domainById = useMemo(() => {
    const m = new Map<string, Domain>()
    domains.forEach((d) => m.set(d.id, d))
    return m
  }, [domains])

  const tlds = useMemo(() => {
    // Collect TLDs from both domains and listings metadata
    const domainTlds = domains.map((d) => d.tld);
    const listingTlds = (listings || [])
      .map((listing) => listing.metadata?.tld)
      .filter((tld): tld is string => Boolean(tld));
    
    return Array.from(new Set([...domainTlds, ...listingTlds])).sort();
  }, [domains, listings])
  const auctionTypes = ['Dutch', 'Sealed Bid', 'English'] as const

  const applyStatus = (a: Auction, status: StatusTab) => {
    const end = new Date(a.endTime).getTime()
    const in24h = end < Date.now() + 24 * 60 * 60 * 1000
    if (status === 'expiring') return a.status === 'active' && in24h
    if (status === 'ongoing') return a.status === 'active'
    if (status === 'liquidation') return (a.type || '').toLowerCase() === 'liquidation'
    return true
  }

  const byStatus = useMemo(() => {
    function applyFilters(list: Auction[]) {
      let out = list

      if (q) {
        const ql = q.toLowerCase()
        out = out.filter((a) => domainById.get(a.domainId)?.name.toLowerCase().includes(ql))
      }
      if (selectedTLDs.length) {
        out = out.filter((a) => {
          const d = domainById.get(a.domainId)
          return d && d.tld && selectedTLDs.includes(d.tld)
        })
      }
      if (selectedTypes.length) {
        out = out.filter((a) => selectedTypes.includes((a.type || '').toLowerCase()))
      }
      if (priceMin || priceMax) {
        const min = priceMin ? parseFloat(priceMin) : 0
        const max = priceMax ? parseFloat(priceMax) : Number.POSITIVE_INFINITY
        out = out.filter((a) => {
          // For auctions, use a simple fallback price logic
          const price = a.parameters?.sealed?.minDepositUsd || 0
          return price >= min && price <= max
        })
      }
      return out
    }

    function applySort(list: Auction[]) {
      const copy = [...list]
      const priceOf = (x: Auction) => x.parameters?.sealed?.minDepositUsd || 0

      if (sortBy === 'ending-soon') copy.sort((a, b) => +new Date(a.endTime) - +new Date(b.endTime))
      else if (sortBy === 'newest') copy.sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime))
      else if (sortBy === 'price-low') copy.sort((a, b) => priceOf(a) - priceOf(b))
      else if (sortBy === 'price-high') copy.sort((a, b) => priceOf(b) - priceOf(a))
      return copy
    }

    const base: Record<StatusTab, Auction[]> = { expiring: [], ongoing: [], liquidation: [], listings: [] }
    auctions.forEach((a) => {
      (['expiring', 'ongoing', 'liquidation'] as StatusTab[]).forEach((s) => {
        if (applyStatus(a, s)) base[s].push(a)
      })
    })

    // Apply pagination to auction results
    const paginate = <T,>(items: T[], page: number): { items: T[], totalPages: number } => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return {
        items: items.slice(startIndex, endIndex),
        totalPages: Math.ceil(items.length / itemsPerPage)
      };
    };

    const expiringFiltered = applySort(applyFilters(base.expiring));
    const ongoingFiltered = applySort(applyFilters(base.ongoing));
    const liquidationFiltered = applySort(applyFilters(base.liquidation));

    return {
      expiring: paginate(expiringFiltered, currentPage.expiring),
      ongoing: paginate(ongoingFiltered, currentPage.ongoing),
      liquidation: paginate(liquidationFiltered, currentPage.liquidation),
      expiringTotal: expiringFiltered.length,
      ongoingTotal: ongoingFiltered.length,
      liquidationTotal: liquidationFiltered.length,
    }
  }, [auctions, q, selectedTLDs, selectedTypes, priceMin, priceMax, sortBy, domainById, currentPage])

  // Filter listings similar to how auctions are filtered
  const filteredListings = useMemo(() => {
    console.log('🗺 Filtering listings:', { 
      originalListings: listings?.length, 
      q, 
      selectedTLDs, 
      selectedTypes 
    });
    
    if (!listings) return [];
    
    let filtered = listings;
    
    // Apply search query filter
    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter((listing) => {
        // Search in domain name from metadata
        const domainName = listing.metadata?.name?.toLowerCase() || '';
        return domainName.includes(ql);
      });
    }
    
    // Apply TLD filter
    if (selectedTLDs.length) {
      filtered = filtered.filter((listing) => {
        const tld = listing.metadata?.tld || '';
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
        if (strategyName.includes('Dutch') && selectedTypes.includes('dutch')) {
          return true;
        } else if (strategyName.includes('English') && selectedTypes.includes('english')) {
          return true;
        } else if (strategyName.includes('Sealed') && selectedTypes.includes('sealed bid')) {
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
    if (sortBy === 'newest') {
      sortedFiltered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'price-low') {
      sortedFiltered.sort((a, b) => {
        try {
          const priceA = parseFloat(formatEther(a.reservePrice));
          const priceB = parseFloat(formatEther(b.reservePrice));
          return priceA - priceB;
        } catch {
          return 0;
        }
      });
    } else if (sortBy === 'price-high') {
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
    console.log('🔎 Filtered result:', { resultCount: result.length });
    return result;
  }, [listings, q, selectedTLDs, selectedTypes, priceMin, priceMax, sortBy]);

  const counts = {
    expiring: byStatus.expiringTotal || 0,
    ongoing: byStatus.ongoingTotal || 0,
    liquidation: byStatus.liquidationTotal || 0,
    listings: filteredListings.length,
  }

  // togglers
  const toggleTLD = (tld: string, checked: boolean) =>
    setSelectedTLDs((prev) => (checked ? [...prev, tld] : prev.filter((x) => x !== tld)))

  const toggleType = (type: string, checked: boolean) => {
    const key = type.toLowerCase()
    setSelectedTypes((prev) => (checked ? [...prev, key] : prev.filter((x) => x !== key)))
  }

  // Page change functions for auctions
  const onAuctionPageChange = (status: StatusTab, page: number) => {
    setCurrentPage(prev => ({ ...prev, [status]: page }));
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage({ expiring: 1, ongoing: 1, liquidation: 1, listings: 1 });
  }, [q, selectedTLDs, selectedTypes, priceMin, priceMax, sortBy]);

  return {
    loading: loading || listingsLoading,
    tab, setTab,
    searchQuery, setSearchQuery,
    tlds, auctionTypes,
    selectedTLDs, toggleTLD,
    selectedTypes, toggleType,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    sortBy, setSortBy,
    byStatus, counts,
    domainById,
    listings: filteredListings,
    listingsError,
    listingsPage,
    listingsTotalPages,
    onListingsPageChange,
    onAuctionPageChange,
    currentPage,
  }
}
