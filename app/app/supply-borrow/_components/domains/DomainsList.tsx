"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, TrendingUp, Layers } from "lucide-react";
import DomainCard from "./DomainCard";
import SearchBox from "../header/SearchBox";
import { getAllDomains, type DomainListItem } from "../data/mockDomains";

interface DomainsListProps {
  domains?: DomainListItem[];
  loading?: boolean;
  query?: string;
  onQueryChange?: (query: string) => void;
}

export default function DomainsList({
  domains,
  loading = false,
  query = "",
  onQueryChange,
}: DomainsListProps) {
  const domainData = domains || getAllDomains();
  const [activeTab, setActiveTab] = useState("all");

  const groupedDomains = useMemo(() => {
    const groups = domainData.reduce((acc, domain) => {
      const tld = domain.tld;
      if (!acc[tld]) {
        acc[tld] = [];
      }
      acc[tld].push(domain);
      return acc;
    }, {} as Record<string, DomainListItem[]>);

    return groups;
  }, [domainData]);

  const filteredDomains = useMemo(() => {
    let filtered = domainData;

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(
        (domain) =>
          domain.name.toLowerCase().includes(query.toLowerCase()) ||
          domain.tld.toLowerCase().includes(query.toLowerCase()) ||
          domain.pool.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by active tab
    if (activeTab !== "all") {
      filtered = filtered.filter((domain) => domain.tld === activeTab);
    }

    return filtered;
  }, [domainData, activeTab, query]);

  const tabs = useMemo(() => {
    const tlds = Object.keys(groupedDomains).sort();
    return [
      { value: "all", label: "All Domains", count: domainData.length },
      ...tlds.map((tld) => ({
        value: tld,
        label: `${tld.toUpperCase()} Domains`,
        count: groupedDomains[tld].length,
      })),
    ];
  }, [groupedDomains, domainData.length]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="text-center space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg sm:text-xl">
                  Earn & Borrow USDC with your Trust Domain.
                </CardTitle>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <SearchBox
                value={query}
                onChange={onQueryChange || (() => {})}
                placeholder="Search domains, TLDs, pools..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              {domainData.length} Active Positions
            </span>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 bg-gray-100 h-auto p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[60px] sm:min-h-[40px]"
            >
              <span className="text-center sm:text-left">{tab.label}</span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
              >
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>

          {filteredDomains.length === 0 && (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No domains found
                </h3>
                <p className="text-gray-600">
                  No domains match the selected filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
