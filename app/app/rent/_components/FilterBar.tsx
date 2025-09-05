"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useActiveRentalListings } from "@/lib/graphql/hooks";
import { useRentalFilters } from "@/lib/rental/filterContext";
import { useMemo } from "react";

export default function FilterBar() {
  const { filters, setFilters } = useRentalFilters();
  const { rentalListings } = useActiveRentalListings(100); // Get more listings to extract TLDs
  
  // Extract unique TLDs from actual rental listings
  const availableTLDs = useMemo(() => {
    const tlds = new Set<string>();
    rentalListings.forEach(listing => {
      if (listing.metadata?.tld) {
        tlds.add(listing.metadata.tld);
      }
    });
    // If no TLDs found from metadata, add common ones as fallback
    if (tlds.size === 0) {
      return ['.ai', '.io', '.football', '.com'];
    }
    return Array.from(tlds).sort();
  }, [rentalListings]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleTldChange = (value: string) => {
    setFilters(prev => ({ ...prev, tld: value === "all" ? "" : value }));
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-");
    setFilters(prev => ({ 
      ...prev, 
      sort: sort as "price" | "expiry" | "domain",
      sortOrder: order as "asc" | "desc" 
    }));
  };

  const handleMinPriceChange = (value: string) => {
    // Allow empty string, numbers, and decimals including 0.0
    if (value === "") {
      setFilters(prev => ({ ...prev, minPrice: undefined }));
    } else {
      const numValue = parseFloat(value);
      // Allow 0 and positive numbers, including decimals
      if (!isNaN(numValue) && numValue >= 0) {
        setFilters(prev => ({ ...prev, minPrice: numValue }));
      }
    }
  };

  const handleMaxPriceChange = (value: string) => {
    // Allow empty string, numbers, and decimals including 0.0
    if (value === "") {
      setFilters(prev => ({ ...prev, maxPrice: undefined }));
    } else {
      const numValue = parseFloat(value);
      // Allow 0 and positive numbers, including decimals
      if (!isNaN(numValue) && numValue >= 0) {
        setFilters(prev => ({ ...prev, maxPrice: numValue }));
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      tld: "",
      minPrice: undefined,
      maxPrice: undefined,
      sort: "domain",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters = filters.search || filters.tld || filters.minPrice !== undefined || filters.maxPrice !== undefined;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="md:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search domains..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* TLD Filter */}
        <div>
          <Select value={filters.tld || "all"} onValueChange={handleTldChange}>
            <SelectTrigger>
              <SelectValue placeholder="TLD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All TLDs</SelectItem>
              {availableTLDs.map(tld => (
                <SelectItem key={tld} value={tld}>{tld}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="md:col-span-2 flex gap-2">
          <Input
            type="number"
            placeholder="Min USDC"
            value={filters.minPrice !== undefined ? filters.minPrice.toString() : ""}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            className="text-sm"
            min="0"
            step="0.01"
          />
          <Input
            type="number"
            placeholder="Max USDC"
            value={filters.maxPrice !== undefined ? filters.maxPrice.toString() : ""}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            className="text-sm"
            min="0"
            step="0.01"
          />
        </div>

        {/* Sort */}
        <div>
          <Select 
            value={`${filters.sort}-${filters.sortOrder}`} 
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domain-asc">Domain A-Z</SelectItem>
              <SelectItem value="domain-desc">Domain Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low-High</SelectItem>
              <SelectItem value="price-desc">Price High-Low</SelectItem>
              <SelectItem value="expiry-asc">Expiry Soon</SelectItem>
              <SelectItem value="expiry-desc">Expiry Later</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}