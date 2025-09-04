"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useExploreRentals } from "@/lib/rental/hooks";
import { useActiveRentalListings } from "@/lib/graphql/hooks";
import { useMemo } from "react";

export default function FilterBar() {
  const { filters, setFilters } = useExploreRentals();
  const { rentalListings } = useActiveRentalListings(100); // Get more listings to extract TLDs
  
  // Extract unique TLDs from actual rental listings
  const availableTLDs = useMemo(() => {
    const tlds = new Set<string>();
    rentalListings.forEach(listing => {
      if (listing.metadata?.tld) {
        tlds.add(listing.metadata.tld);
      }
    });
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

  const handlePriceRangeChange = (min?: number, max?: number) => {
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
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
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min ETH"
            value={filters.minPrice || ""}
            onChange={(e) => handlePriceRangeChange(
              e.target.value ? parseFloat(e.target.value) : undefined,
              filters.maxPrice
            )}
            className="text-sm"
            min="0"
            step="0.0001"
          />
          <Input
            type="number"
            placeholder="Max ETH"
            value={filters.maxPrice || ""}
            onChange={(e) => handlePriceRangeChange(
              filters.minPrice,
              e.target.value ? parseFloat(e.target.value) : undefined
            )}
            className="text-sm"
            min="0"
            step="0.0001"
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