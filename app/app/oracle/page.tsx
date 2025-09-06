"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Globe,
  CheckCircle,
  Loader2,
  ExternalLink,
  Calendar,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { toast } from "@/hooks/use-toast";
import { useOracleSetup } from "./_hooks/useOracleSetup";
import { useMyDomains } from "@/lib/graphql/hooks";
import OracleSkeleton from "./_components/OracleSkeleton";
import type { EnhancedDomainItem } from "@/lib/graphql/services";

// Lazy load heavy components
const DomainSelector = dynamic(() => import('../supply-borrow/_components/domains/DomainSelector'), {
  loading: () => <DomainSelectorSkeleton />,
  ssr: false
});

const OracleInstructions = dynamic(() => import('./_components/OracleInstruction'), {
  loading: () => <InstructionsSkeleton />,
  ssr: false
});

// Component skeletons
function DomainSelectorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

function InstructionsSkeleton() {
  return (
    <Card className="mt-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function OraclePage() {
  const { isConnected, address } = useAccount();
  const {
    setDomainInfo,
    isDomainInfoLoading,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useOracleSetup();

  // Get domains loading state for skeleton
  const { loading: isLoadingDomains } = useMyDomains(address);

  const [selectedDomain, setSelectedDomain] = useState<
    EnhancedDomainItem | undefined
  >();
  const [valueUsd, setValueUsd] = useState("1000");
  const [expiryYears, setExpiryYears] = useState("2");

  // Calculate expiry timestamp
  const calculateExpiryTimestamp = (years: string) => {
    const yearsNum = parseInt(years) || 1;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime + yearsNum * 365 * 24 * 60 * 60;
  };

  // Format value to 6 decimals for USDC
  const formatValueToUsd6 = (value: string) => {
    const valueNum = parseFloat(value) || 0;
    return Math.floor(valueNum * 1000000); // Convert to 6 decimals
  };

  const handleSetPremiumDomain = async () => {
    if (
      !selectedDomain ||
      !selectedDomain.tokenId ||
      !selectedDomain.tokenAddress
    ) {
      toast({
        title: "Invalid Domain",
        description: "Please select a valid domain NFT.",
        variant: "destructive",
      });
      return;
    }

    const valueUsd6 = formatValueToUsd6(valueUsd);
    if (valueUsd6 <= 0) {
      toast({
        title: "Invalid Value",
        description: "Domain value must be greater than 0 USD.",
        variant: "destructive",
      });
      return;
    }

    const expiryTimestamp = calculateExpiryTimestamp(expiryYears);
    const currentTime = Math.floor(Date.now() / 1000);
    const minimumExpiry = currentTime + 30 * 24 * 60 * 60; // 30 days

    if (expiryTimestamp <= minimumExpiry) {
      toast({
        title: "Invalid Expiry",
        description: "Domain must expire at least 30 days from now.",
        variant: "destructive",
      });
      return;
    }

    try {
      await setDomainInfo({
        nftContract: selectedDomain.tokenAddress,
        tokenId: BigInt(selectedDomain.tokenId),
        isPremium: true,
        valueUsd6: BigInt(valueUsd6),
        expiresAt: BigInt(expiryTimestamp),
      });
    } catch (err) {
      console.error("Failed to set domain info:", err);
    }
  };

  // Success toast with transaction link
  const showSuccessToast = (hash: string) => {
    const txLink = `https://explorer-testnet.doma.xyz/tx/${hash}`;

    toast({
      title: "Domain Premium Setup Successful",
      description: (
        <div className="space-y-2">
          <p>Successfully set domain as premium with Oracle</p>
          <a
            href={txLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ),
      duration: 8000,
    });
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      showSuccessToast(hash);
      // Reset form
      setSelectedDomain(undefined);
      setValueUsd("1000");
      setExpiryYears("2");
    }
  }, [isConfirmed, hash]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 lg:px-12 py-10">
        <Card className="max-w-md mx-auto dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect your wallet to access Oracle configuration
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isConnected && isLoadingDomains) {
    return <OracleSkeleton />;
  }

  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      {/* Page Header */}
      <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 dark:bg-gray-800 dark:border-gray-700 shadow-sm mb-8">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-xl sm:text-2xl dark:text-white">
                  Domain Oracle Configuration
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Set up premium domains for lending pool collateral
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Oracle Testing Mode
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Domain Selection */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Select Domain NFT
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose a domain NFT to configure as premium collateral
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Suspense fallback={<DomainSelectorSkeleton />}>
              <DomainSelector
                onDomainSelect={setSelectedDomain}
                selectedDomain={selectedDomain}
                disabled={isPending || isConfirming}
              />
            </Suspense>

            {selectedDomain ? (
              <>
                {/* Ringkas: header terpilih */}
                <div className="rounded-xl border border-gray-200 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-blue-900 dark:text-blue-300">
                          {selectedDomain.name?.split(".")[0] || "—"}
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                          {selectedDomain.name?.includes(".")
                            ? `.${selectedDomain.name.split(".").pop()}`
                            : ".doma"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-blue-700/90 dark:text-blue-300/90">
                        <span className="font-mono">
                          Token ID:{" "}
                          {String(selectedDomain.tokenId).length > 16
                            ? `${String(selectedDomain.tokenId).slice(
                                0,
                                8
                              )}…${String(selectedDomain.tokenId).slice(-6)}`
                            : selectedDomain.tokenId}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">
                          Contract: {selectedDomain.tokenAddress?.slice(0, 6)}…
                          {selectedDomain.tokenAddress?.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <Badge className="shrink-0 rounded-full bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800">
                      Selected
                    </Badge>
                  </div>

                  {/* badges kecil */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-white px-3 py-2 text-xs text-blue-800 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                      ✓ Verified ownership
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 text-xs text-blue-800 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                      ✓ Transferable NFT
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 text-xs text-blue-800 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                      ✓ Eligible as collateral
                    </div>
                  </div>
                </div>

                {/* ACTIONS CEPAT */}
                <div className="mt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        String(selectedDomain.tokenId)
                      )
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-50 dark:border-blue-800 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    Copy Token ID
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        selectedDomain.tokenAddress || ""
                      )
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-50 dark:border-blue-800 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    Copy Contract
                  </button>
                  <a
                    href={`https://explorer-testnet.doma.xyz/address/${selectedDomain.tokenAddress}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-50 dark:border-blue-800 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    View Contract
                  </a>
                  <a
                    href={`https://explorer-testnet.doma.xyz/nft/${selectedDomain.tokenAddress}/${selectedDomain.tokenId}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-50 dark:border-blue-800 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    View NFT
                  </a>
                </div>

                {/* INFO RINGKAS */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-blue-800 dark:bg-transparent">
                    <div className="text-blue-700 dark:text-blue-300">
                      Est. Value
                    </div>
                    <div className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                      ${valueUsd} USD
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-blue-800 dark:bg-transparent">
                    <div className="text-blue-700 dark:text-blue-300">
                      Expiry (preview)
                    </div>
                    <div className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {new Date(
                        calculateExpiryTimestamp(expiryYears) * 1000
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-blue-800 dark:bg-transparent">
                    <div className="text-blue-700 dark:text-blue-300">
                      Label Length
                    </div>
                    <div className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {(selectedDomain.name?.split(".")?.[0] || "").length}{" "}
                      chars
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-blue-800 dark:bg-transparent">
                    <div className="text-blue-700 dark:text-blue-300">TLD</div>
                    <div className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                      .{selectedDomain.name?.split(".")?.pop() || "tld"}
                    </div>
                  </div>
                </div>

                {/* ATTRIBUTES */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs dark:border-blue-800 dark:bg-transparent">
                  <div className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                    Attributes
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:ring-blue-800">
                      <span>Token ID (short)</span>
                      <span className="font-mono">
                        {String(selectedDomain.tokenId).length > 16
                          ? `${String(selectedDomain.tokenId).slice(
                              0,
                              8
                            )}…${String(selectedDomain.tokenId).slice(-6)}`
                          : selectedDomain.tokenId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:ring-blue-800">
                      <span>Contract (short)</span>
                      <span className="font-mono">
                        {selectedDomain.tokenAddress?.slice(0, 6)}…
                        {selectedDomain.tokenAddress?.slice(-4)}
                      </span>
                    </div>
                    {selectedDomain.owner && (
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:ring-blue-800">
                        <span>Owner</span>
                        <span className="font-mono">
                          {selectedDomain.owner.slice(0, 6)}…
                          {selectedDomain.owner.slice(-4)}
                        </span>
                      </div>
                    )}
                    {selectedDomain.createdAt && (
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:ring-blue-800">
                        <span>Created</span>
                        <span>
                          {new Date(
                            Number(selectedDomain.createdAt) * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs dark:border-blue-800 dark:bg-transparent">
                  <div className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                    Activity
                  </div>
                  <ol className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                      Selected domain & validated metadata
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                      Prepared premium parameters (value & expiry)
                    </li>
                    <li className="flex items-center gap-2 opacity-70">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600/50 dark:bg-blue-300/50" />
                      Awaiting on-chain confirmation after submit
                    </li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Please select a domain NFT to configure as premium collateral.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Oracle Configuration */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Premium Configuration
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set domain value and expiry for premium status
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Value */}
            <div>
              <Label
                htmlFor="value"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Domain Value (USD)
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="value"
                  type="number"
                  placeholder="1000"
                  value={valueUsd}
                  onChange={(e) => setValueUsd(e.target.value)}
                  className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="1"
                  step="1"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    USD
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum value: $1 USD
              </p>
            </div>

            {/* Expiry Years */}
            <div>
              <Label
                htmlFor="expiry"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Expiry (Years from now)
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="expiry"
                  type="number"
                  placeholder="2"
                  value={expiryYears}
                  onChange={(e) => setExpiryYears(e.target.value)}
                  className="pr-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="1"
                  max="10"
                  step="1"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Years
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 30 days from now
              </p>
            </div>

            {/* Set Premium Button */}
            <Button
              onClick={handleSetPremiumDomain}
              disabled={
                !selectedDomain ||
                isDomainInfoLoading ||
                isPending ||
                isConfirming
              }
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isDomainInfoLoading || isPending || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending
                    ? "Setting Premium..."
                    : isConfirming
                    ? "Confirming..."
                    : "Loading..."}
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Set Domain as Premium
                </>
              )}
            </Button>

            {/* ===== Tambahan untuk mengisi area kosong di bawah tombol ===== */}
            {selectedDomain ? (
              <>
                {/* Review ringkas sebelum submit */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
                  <div className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-200">
                    Review before submit
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-blue-200 dark:bg-transparent dark:ring-blue-900/40">
                      <div className="text-blue-700 dark:text-blue-300">
                        Domain
                      </div>
                      <div className="mt-0.5 font-medium text-blue-900 dark:text-blue-100 truncate">
                        {selectedDomain.name}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-blue-200 dark:bg-transparent dark:ring-blue-900/40">
                      <div className="text-blue-700 dark:text-blue-300">
                        Value (USD)
                      </div>
                      <div className="mt-0.5 font-medium text-blue-900 dark:text-blue-100">
                        ${valueUsd}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-blue-200 dark:bg-transparent dark:ring-blue-900/40">
                      <div className="text-blue-700 dark:text-blue-300">
                        Expiry
                      </div>
                      <div className="mt-0.5 font-medium text-blue-900 dark:text-blue-100">
                        {new Date(
                          calculateExpiryTimestamp(expiryYears) * 1000
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4 text-xs dark:border-neutral-800 dark:bg-transparent">
                  <div className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    What happens next
                  </div>
                  <ol className="list-decimal space-y-1 pl-5 text-neutral-700 dark:text-neutral-300">
                    <li>Wallet opens to approve the transaction.</li>
                    <li>Tx is broadcast to the network (Testnet).</li>
                    <li>
                      Oracle state updates to{" "}
                      <span className="font-medium">isPremium = true</span> with
                      the value &amp; expiry provided.
                    </li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-300">
                Select a domain on the left to preview and submit premium setup.
              </div>
            )}
            {/* ===== end tambahan ===== */}
          </CardContent>
        </Card>
      </div>
      
      <Suspense fallback={<InstructionsSkeleton />}>
        <OracleInstructions />
      </Suspense>
    </div>
  );
}
