"use client";

import React, { createContext, useContext, useState } from 'react';
import { ExploreFilters } from './types';

interface FilterContextType {
  filters: ExploreFilters;
  setFilters: React.Dispatch<React.SetStateAction<ExploreFilters>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<ExploreFilters>({
    search: "",
    tld: "",
    minPrice: undefined,
    maxPrice: undefined,
    sort: "domain",
    sortOrder: "asc",
  });

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useRentalFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useRentalFilters must be used within a FilterProvider');
  }
  return context;
}