"use client";

import * as React from "react";
import { Timer, Globe } from "lucide-react";
import usdcLogo from "../../../../../public/images/LogoCoin/usd-coin-usdc-logo.png";
import { useAccount } from "wagmi";
import { useMyDomains, useMyAuctions, useMyBids } from "@/lib/graphql";
import { getStrategyName } from "@/lib/utils/strategy";

export type AuctionType = "Dutch" | "Sealed" | "English";
export type AuctionState = "LIVE" | "SCHEDULED" | "ENDED";

export interface AuctionRow {
  id: string;
  domain: string;
  type: AuctionType;
  state: AuctionState;
  timeLeft: string;
  top: string;
  createdAt: string;
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
    createdAt: "2025-09-01",
  },
  {
    id: "a2",
    domain: "beta.xyz",
    type: "Dutch",
    state: "SCHEDULED",
    timeLeft: "Starts in 3h",
    top: "$3,200",
    createdAt: "2025-09-02",
  },
  {
    id: "a3",
    domain: "gamma.io",
    type: "English",
    state: "ENDED",
    timeLeft: "Ended",
    top: "$5,400",
    createdAt: "2025-08-30",
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

  // Get wallet address for fetching user's data
  const { address } = useAccount();

  // Fetch data from GraphQL
  const {
    domains: graphqlDomains,
    loading: domainsLoading,
    error: domainsError,
  } = useMyDomains(address);

  const {
    auctions: graphqlAuctions = [],
    loading: auctionsLoading = false,
    error: auctionsError,
  } = useMyAuctions(10);

  const {
    bids: graphqlBids = [],
    loading: bidsLoading = false,
    error: bidsError,
    totalCount: totalBids = 0,
  } = useMyBids(10);

  // Debug logging
  React.useEffect(() => {
    console.log("=== DASHBOARD DEBUG ===");
    console.log("Dashboard - Wallet address:", address);
    console.log("Dashboard - GraphQL domains:", graphqlDomains);
    console.log("Dashboard - GraphQL domains length:", graphqlDomains?.length);
    console.log("Dashboard - GraphQL auctions:", graphqlAuctions);
    console.log("Dashboard - GraphQL auctions length:", graphqlAuctions?.length);
    console.log("Dashboard - GraphQL bids:", graphqlBids);
    console.log("Dashboard - GraphQL bids length:", graphqlBids?.length);
    console.log("Dashboard - Domains loading:", domainsLoading);
    console.log("Dashboard - Auctions loading:", auctionsLoading);
    console.log("Dashboard - Bids loading:", bidsLoading);
    console.log("Dashboard - Errors:", { domainsError, auctionsError, bidsError });
    console.log("======================");
  }, [address, graphqlDomains, graphqlAuctions, graphqlBids, domainsLoading, auctionsLoading, bidsLoading, domainsError, auctionsError, bidsError]);

  React.useEffect(() => {
    // Remove artificial delay - load UI immediately
    setLoading(false);
  }, []);

  // Only block if GraphQL is actively loading with wallet connected
  const isLoading = address && (domainsLoading || auctionsLoading || bidsLoading);

  // Transform GraphQL auctions to AuctionRow format
  const realAuctions = React.useMemo((): AuctionRow[] => {
    console.log("useDashboardData - processing auctions:", graphqlAuctions);
    console.log("useDashboardData - auctions loading:", auctionsLoading);
    console.log("useDashboardData - auctions error:", auctionsError);
    console.log("useDashboardData - wallet address:", address);
    
    // If wallet is connected, always use GraphQL data (even if empty)
    if (address) {
      if (graphqlAuctions && graphqlAuctions.length > 0) {
        const transformed = graphqlAuctions.map((auction: any) => {
          // Convert wei to ETH for prices
          const reservePrice = auction.reservePrice ? 
            (parseFloat(auction.reservePrice) / 1e18).toFixed(4) : '0';
          const winningBid = auction.winningBid ? 
            (parseFloat(auction.winningBid) / 1e18).toFixed(4) : null;

          // Get proper domain name from metadata
          const domainName = auction.metadata?.name 
            ? `${auction.metadata.name}${auction.metadata.tld || '.doma'}`
            : `Token #${auction.tokenId.slice(-8)}`;

          // Get auction type from strategy
          const auctionType = getStrategyName(auction.strategy);
          const shortType = auctionType === 'English Auction' ? 'English' :
                           auctionType === 'Dutch Auction' ? 'Dutch' :
                           auctionType === 'Sealed Bid Auction' ? 'Sealed' : 'English';

          // Format created date
          const createdDate = auction.createdAt ? 
            new Date(parseInt(auction.createdAt) * 1000).toLocaleDateString() : 
            new Date().toLocaleDateString();

          return {
            id: auction.id,
            domain: domainName,
            type: shortType as AuctionType,
            state: auction.status === "Listed" ? "LIVE" : 
                   auction.status === "Sold" ? "ENDED" : "SCHEDULED" as AuctionState,
            timeLeft: auction.status === "Listed" ? "Active" : 
                     auction.status === "Sold" ? "Ended" : "Scheduled",
            top: winningBid ? `${winningBid} ETH` : `${reservePrice} ETH`,
            createdAt: createdDate,
          };
        });
        console.log("useDashboardData - transformed auctions:", transformed);
        return transformed;
      } else if (!auctionsLoading) {
        // Connected wallet but no auctions - return empty array
        console.log("useDashboardData - no GraphQL auctions found for this wallet");
        return [];
      } else {
        // Still loading
        console.log("useDashboardData - auctions still loading");
        return [];
      }
    }
    
    // If no wallet, show mock data for demo
    console.log("useDashboardData - no wallet, using mock data");
    return MOCK_AUCTIONS;
  }, [graphqlAuctions, auctionsLoading, auctionsError, address]);

  // Transform GraphQL bids to BidRow format  
  const realBids = React.useMemo((): BidRow[] => {
    console.log("useDashboardData - processing bids:", graphqlBids);
    console.log("useDashboardData - bids loading:", bidsLoading);
    console.log("useDashboardData - bids error:", bidsError);
    console.log("useDashboardData - wallet address:", address);
    
    // If wallet is connected, always use GraphQL data (even if empty)
    if (address) {
      if (graphqlBids && graphqlBids.length > 0) {
        const transformed = graphqlBids.map((bid: any) => {
          // Convert wei to ETH for bid amount
          const bidAmount = bid.amount ? 
            (parseFloat(bid.amount) / 1e18).toFixed(4) : '0';

          return {
            id: bid.id,
            domain: `Listing #${bid.listingId}`,
            type: "English" as AuctionType,
            yourBid: `${bidAmount} ETH`,
            phaseOrRank: "-",
            result: "Pending" as const,
            txHash: bid.transactionHash,
          };
        });
        console.log("useDashboardData - transformed bids:", transformed);
        return transformed;
      } else if (!bidsLoading) {
        // Connected wallet but no bids - return empty array
        console.log("useDashboardData - no GraphQL bids found for this wallet");
        return [];
      } else {
        // Still loading
        console.log("useDashboardData - bids still loading");
        return [];
      }
    }
    
    // If no wallet, show mock data for demo
    console.log("useDashboardData - no wallet, using mock bids");
    return MOCK_BIDS;
  }, [graphqlBids, bidsLoading, bidsError, address]);

  const auctions = React.useMemo(
    () =>
      realAuctions.filter((r) =>
        r.domain.toLowerCase().includes(query.toLowerCase())
      ),
    [query, realAuctions]
  );
  
  const bids = React.useMemo(
    () =>
      realBids.filter((r) =>
        r.domain.toLowerCase().includes(query.toLowerCase())
      ),
    [query, realBids]
  );
  // Transform GraphQL domains to DomainRow format
  const realDomains = React.useMemo((): DomainRow[] => {
    console.log("useDashboardData - transforming domains:", graphqlDomains);
    console.log("useDashboardData - wallet address:", address);
    console.log("useDashboardData - domains loading:", domainsLoading);
    console.log("useDashboardData - domains error:", domainsError);

    // Use GraphQL domains if available
    if (graphqlDomains && graphqlDomains.length > 0) {
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
        royalty: undefined,
        tokenAddress: domain.tokenAddress,
        tokenId: domain.tokenId,
        tokenChain: domain.tokenChain || "Doma Testnet",
      }));

      console.log("useDashboardData - transformed domains:", transformed);
      return transformed;
    }

    // Show empty state if wallet connected but no domains
    if (address && !domainsLoading) {
      console.log("useDashboardData - wallet connected but no domains found");
      return [];
    }

    // Show loading state
    console.log("useDashboardData - still loading or no wallet");
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
      value: String(realAuctions.filter((a) => a.state === "LIVE").length),
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
    domainsError: domainsError || auctionsError || bidsError,
  };
}
