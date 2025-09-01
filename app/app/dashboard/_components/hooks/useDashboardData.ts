"use client";

import * as React from "react";
import { Timer, Globe } from "lucide-react";
import usdcLogo from "../../../../../public/images/LogoCoin/usd-coin-usdc-logo.png";
import { useAccount } from "wagmi";
import { useMyDomains } from "@/lib/graphql";

export type AuctionType = "Dutch" | "Sealed" | "English";
export type AuctionState = "LIVE" | "SCHEDULED" | "ENDED";

export interface AuctionRow {
  id: string;
  domain: string;
  type: AuctionType;
  state: AuctionState;
  timeLeft: string;
  top: string;
}
export interface BidRow {
  id: string;
  domain: string;
  type: AuctionType;
  yourBid: string;
  phaseOrRank: string;
  result: "Pending" | "Won" | "Lost";
  txHash?: string;
}
export interface DomainRow {
  id: string;
  domain: string;
  name: string;
  tld: string;
  verified: boolean;
  status: "Owned" | "Escrowed";
  expiresAt?: string;
  royalty?: number; // Royalty percentage (e.g., 2.5)
  tokenAddress?: string; // Token contract address
  tokenId?: string; // Token ID
  tokenChain?: string; // Token chain name or network ID
}

const MOCK_AUCTIONS: AuctionRow[] = [
  {
    id: "a1",
    domain: "alpha.com",
    type: "Sealed",
    state: "LIVE",
    timeLeft: "01:12:05",
    top: "-",
  },
  {
    id: "a2",
    domain: "beta.xyz",
    type: "Dutch",
    state: "SCHEDULED",
    timeLeft: "Starts in 3h",
    top: "$3,200",
  },
  {
    id: "a3",
    domain: "gamma.io",
    type: "English",
    state: "ENDED",
    timeLeft: "Ended",
    top: "$5,400",
  },
];
const MOCK_BIDS: BidRow[] = [
  {
    id: "b1",
    domain: "alpha.com",
    type: "Sealed",
    yourBid: "$2,100",
    phaseOrRank: "Commit",
    result: "Pending",
  },
  {
    id: "b2",
    domain: "delta.io",
    type: "English",
    yourBid: "$1,150",
    phaseOrRank: "#2 of 7",
    result: "Lost",
    txHash: "0xabc...",
  },
  {
    id: "b3",
    domain: "beta.xyz",
    type: "Dutch",
    yourBid: "$3,200",
    phaseOrRank: "-",
    result: "Won",
    txHash: "0xdef...",
  },
];

export function useDashboardData() {
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"auctions" | "bids" | "domains">(
    "auctions"
  );
  const [query, setQuery] = React.useState("");

  // Get wallet address for fetching user's domains
  const { address } = useAccount();

  // Fetch domains from GraphQL
  const {
    domains: graphqlDomains,
    loading: domainsLoading,
    error: domainsError,
  } = useMyDomains(address);

  // Debug logging
  React.useEffect(() => {
    console.log("=== DASHBOARD DEBUG ===");
    console.log("Dashboard - Wallet address:", address);
    console.log("Dashboard - GraphQL domains:", graphqlDomains);
    console.log("Dashboard - GraphQL domains length:", graphqlDomains?.length);
    console.log("Dashboard - Domains loading:", domainsLoading);
    console.log("Dashboard - Domains error:", domainsError);
    console.log("======================");
  }, [address, graphqlDomains, domainsLoading, domainsError]);

  React.useEffect(() => {
    // Remove artificial delay - load UI immediately
    setLoading(false);
  }, []);

  // Only block if GraphQL is actively loading with wallet connected
  const isLoading = address && domainsLoading;

  const auctions = React.useMemo(
    () =>
      MOCK_AUCTIONS.filter((r) =>
        r.domain.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );
  const bids = React.useMemo(
    () =>
      MOCK_BIDS.filter((r) =>
        r.domain.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );
  // Transform GraphQL domains to DomainRow format
  const realDomains = React.useMemo((): DomainRow[] => {
    console.log("useDashboardData - transforming domains:", graphqlDomains);
    console.log("useDashboardData - wallet address:", address);
    console.log("useDashboardData - domains loading:", domainsLoading);
    console.log("useDashboardData - domains error:", domainsError);

    // Only use GraphQL domains, no fallback
    if (graphqlDomains && graphqlDomains.length > 0) {
      // useDashboardData.tsx (bagian transform)
      const transformed = graphqlDomains.map((domain, index) => ({
        id: `domain-${index}`,
        domain: domain.name,
        name: domain.name,
        tld: domain.name.includes(".")
          ? "." + domain.name.split(".").pop()
          : ".doma",
        verified: true,
        status: "Owned" as const,
        expiresAt: domain.expiresAt,
        // Royalty belum ada di schema → tampilkan N/A
        royalty: undefined,
        tokenAddress: domain.tokenAddress,
        tokenId: domain.tokenId,
        tokenChain: domain.tokenChain,
      }));

      console.log("useDashboardData - transformed domains:", transformed);
      return transformed;
    }

    console.log("useDashboardData - no GraphQL domains, returning empty array");
    return [];
  }, [graphqlDomains, address, domainsLoading, domainsError]);

  const domains = React.useMemo(() => {
    const filtered = realDomains.filter((r) =>
      r.domain.toLowerCase().includes(query.toLowerCase())
    );
    console.log("useDashboardData - final domains after filter:", filtered);
    return filtered;
  }, [query, realDomains]);

  const kpis = [
    { label: "Earnings", value: "$0", delta: 0, icon: usdcLogo },
    {
      label: "Active Auctions",
      value: String(MOCK_AUCTIONS.filter((a) => a.state === "LIVE").length),
      delta: 0,
      icon: Timer,
    },
    {
      label: "Domains",
      value: String(realDomains.length),
      delta: 0,
      icon: Globe,
    },
  ] as const;

  return {
    loading: isLoading,
    tab,
    setTab,
    query,
    setQuery,
    kpis,
    auctions,
    bids,
    domains,
    domainsError,
  };
}
