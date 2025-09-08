"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Globe,
  Loader2,
  TrendingDown,
} from "lucide-react";
import Image from "next/image";
import {
  useLendingPool,
  formatUSDC,
  parseUSDC,
  formatAPR,
  formatHealthFactor,
  calculateCurrentDebt,
} from "@/hooks/useLendingPool";
import { useAccount } from "wagmi";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import DomainSelector from "../domains/DomainSelector";
import type { EnhancedDomainItem } from "@/lib/graphql/services";
import { CONTRACTS } from "@/hooks/contracts/constants";
import { apolloClient } from "@/lib/graphql/client";
import { GET_NAME_FROM_TOKEN_QUERY } from "@/lib/graphql/queries";
import type {
  NameFromTokenResponse,
  NameFromTokenVariables,
  NFTMetadata,
} from "@/lib/graphql/types";

interface BorrowPanelProps {
  className?: string;
}

export default function BorrowPanel({ className }: BorrowPanelProps) {
  const { isConnected } = useAccount();
  const {
    poolData,
    userPosition,
    usdcBalance,
    usdcAllowance,
    userTotalDebt,
    approveUSDC,
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    approveNFT,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  } = useLendingPool();

  const [tab, setTab] = useState<"borrow" | "repay">("borrow");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<
    EnhancedDomainItem | undefined
  >();
  const [nftApproved, setNftApproved] = useState(false);
  const [act, setAct] = useState<
    | "approve-nft"
    | "deposit"
    | "withdraw"
    | "approve-usdc"
    | "borrow"
    | "repay"
    | null
  >(null);
  const [meta, setMeta] = useState<NFTMetadata | null>(null);

  const hasCol = userPosition.collateral.active;
  const hasDebt = userPosition.debt.principal > BigInt(0);

  const currentDebt = (() => {
    if (userTotalDebt && userTotalDebt > BigInt(0)) return userTotalDebt;
    return calculateCurrentDebt(
      userPosition.debt.principal,
      userPosition.debt.lastAccrued,
      poolData.aprBps
    );
  })();

  useEffect(() => {
    if (!isConfirmed || !act || !hash) return;
    toast({
      title:
        act === "approve-nft"
          ? "NFT Approved"
          : act === "deposit"
          ? "Collateral Deposited"
          : act === "withdraw"
          ? "Collateral Withdrawn"
          : act === "approve-usdc"
          ? "USDC Approved"
          : act === "borrow"
          ? "Borrowed"
          : "Repaid",
      description: (
        <a
          href={`https://explorer-testnet.doma.xyz/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          View transaction
        </a>
      ),
      duration: 7000,
    });
    if (act === "borrow") setBorrowAmount("");
    if (act === "repay") setRepayAmount("");
    if (act === "deposit") {
      setSelectedDomain(undefined);
      setNftApproved(false);
    }
    if (act === "approve-usdc") setNeedsApproval(false);
    setAct(null);
  }, [isConfirmed, act, hash]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (repayAmount && typeof usdcAllowance === "bigint" && tab === "repay") {
      setNeedsApproval(parseUSDC(repayAmount) > usdcAllowance);
    } else {
      setNeedsApproval(false);
    }
  }, [repayAmount, usdcAllowance, tab]);

  useEffect(() => {
    const load = async () => {
      if (!hasCol || !userPosition.collateral.tokenId) return setMeta(null);
      const tokenId = userPosition.collateral.tokenId.toString();
      try {
        const { data } = await apolloClient.query<
          NameFromTokenResponse,
          NameFromTokenVariables
        >({
          query: GET_NAME_FROM_TOKEN_QUERY,
          variables: { tokenId },
          errorPolicy: "all",
        });
        const name = data?.nameStatistics?.name;
        if (!name)
          return setMeta({
            name: `Domain-${tokenId.slice(-8)}`,
            tld: ".doma",
            description: "",
          });
        const [sld, tld] = name.split(".");
        setMeta({
          name: sld || name,
          tld: tld ? `.${tld}` : ".doma",
          description: "",
        });
      } catch {
        setMeta({
          name: `Domain-${tokenId.slice(-8)}`,
          tld: ".doma",
          description: "",
        });
      }
    };
    load();
  }, [hasCol, userPosition.collateral.tokenId]);

  const hfNew = () => {
    if (!borrowAmount || !hasCol) return userPosition.healthFactor;
    const debt = userPosition.debt.principal + parseUSDC(borrowAmount);
    const col = userPosition.collateral.valueUsd6;
    const lt = BigInt(poolData.liqThresholdBps);
    if (debt === BigInt(0)) return BigInt(0);
    return (((col * lt) / BigInt(10000)) * BigInt(1e18)) / debt;
  };

  const hfClass = (hf: bigint) => {
    const v = Number(hf) / 1e18;
    if (v >= 2) return "text-blue-600";
    if (v >= 1.5) return "text-yellow-600";
    if (v >= 1.2) return "text-orange-600";
    return "text-red-600";
  };

  const borrowAPR = formatAPR(poolData.aprBps);

  if (!isConnected) {
    return (
      <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <Globe className="mx-auto mb-3 h-6 w-6 text-neutral-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Connect your wallet to borrow USDC
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
            Borrow USDC
          </CardTitle>
          <Badge className="gap-1 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/50">
            <TrendingDown className="h-3 w-3" />
            {borrowAPR}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {!hasCol ? (
          <div className="mb-5 space-y-3">
            <DomainSelector
              onDomainSelect={setSelectedDomain}
              selectedDomain={selectedDomain}
              disabled={isPending || isConfirming}
            />
            {selectedDomain && (
              <div className="grid gap-2">
                {!nftApproved && (
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={async () => {
                      if (
                        !selectedDomain?.tokenAddress ||
                        !selectedDomain?.tokenId
                      )
                        return;
                      setAct("approve-nft");
                      await approveNFT(
                        selectedDomain.tokenAddress,
                        BigInt(selectedDomain.tokenId)
                      );
                      setNftApproved(true);
                    }}
                    disabled={
                      (isPending && act === "approve-nft") ||
                      (isConfirming && act === "approve-nft")
                    }
                  >
                    {(isPending && act === "approve-nft") ||
                    (isConfirming && act === "approve-nft") ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span className="ml-2">Approve NFT</span>
                  </Button>
                )}
                <Button
                  className="h-10"
                  onClick={async () => {
                    if (!selectedDomain?.tokenId) return;
                    setAct("deposit");
                    await depositCollateral(
                      CONTRACTS.DomainNFT,
                      BigInt(selectedDomain.tokenId)
                    );
                  }}
                  disabled={
                    !nftApproved ||
                    (isPending && act === "deposit") ||
                    (isConfirming && act === "deposit")
                  }
                >
                  {(isPending && act === "deposit") ||
                  (isConfirming && act === "deposit") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  <span className="ml-2">
                    {(isPending && act === "deposit") ||
                    (isConfirming && act === "deposit")
                      ? "Depositing…"
                      : `Use ${
                          selectedDomain?.name.split(".")[0]
                        } as Collateral`}
                  </span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-5 rounded-lg ring-1 ring-blue-200 dark:ring-blue-900/50 bg-blue-50/60 dark:bg-blue-900/10 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px] flex items-center justify-center gap-1.5">
                <Image
                  src="/images/logo/doma-logo-2.jpg"
                  alt="Domain NFT"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <div className="font-medium text-blue-800 dark:text-blue-300">
                  {meta ? `${meta.name}${meta.tld}` : "Domain"}
                </div>
              </div>

              {!hasDebt && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    setAct("withdraw");
                    await withdrawCollateral();
                  }}
                  disabled={
                    (isPending && act === "withdraw") ||
                    (isConfirming && act === "withdraw")
                  }
                >
                  {(isPending && act === "withdraw") ||
                  (isConfirming && act === "withdraw") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="text-blue-700/80 dark:text-blue-300/80">
                Est. Domain price : {formatUSDC(userPosition.collateral.valueUsd6)}{" "}
              </div>
              <Image
                src="/images/LogoCoin/usd-coin-usdc-logo.png"
                alt="logo usdc"
                width={16}
                height={24}
                className="rounded-full"
              />
            </div>
          </div>
        )}

        {hasCol && (
          <>
            <div className="grid grid-cols-2 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-700 overflow-hidden mb-4">
              <Button
                onClick={() => setTab("borrow")}
                variant={tab === "borrow" ? "default" : "ghost"}
                className={cn(
                  "h-8 rounded-none",
                  tab !== "borrow" && "bg-transparent text-gray-700 dark:text-gray-300"
                )}
              >
                Borrow
              </Button>
              <Button
                onClick={() => setTab("repay")}
                variant={tab === "repay" ? "default" : "ghost"}
                className={cn(
                  "h-8 rounded-none",
                  tab !== "repay" && "bg-transparent text-gray-700 dark:text-gray-300"
                )}
              >
                Repay
              </Button>
            </div>

            {tab === "borrow" ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] text-neutral-500 dark:text-neutral-400 mb-1">
                    <span>Amount</span>
                    <span className="inline-flex items-center gap-1">
                      Max: {formatUSDC(userPosition.maxBorrowable)}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="pr-20 h-10 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 dark:text-white"
                        onClick={() =>
                          setBorrowAmount(
                            formatUSDC(userPosition.maxBorrowable)
                          )
                        }
                      >
                        MAX
                      </Button>
                      <Image
                        src="/images/LogoCoin/usd-coin-usdc-logo.png"
                        alt="USDC"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                </div>

                {borrowAmount && (
                  <div className="rounded-lg ring-1 ring-blue-200 dark:ring-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 p-3 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Borrow APR</span>
                      <span className="text-gray-900 dark:text-gray-100">{borrowAPR}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-700 dark:text-gray-300">New Health Factor</span>
                      <span className={hfClass(hfNew())}>
                        {formatHealthFactor(hfNew())}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-10"
                  onClick={async () => {
                    if (!borrowAmount) return;
                    setAct("borrow");
                    await borrow(parseUSDC(borrowAmount));
                  }}
                  disabled={
                    !borrowAmount ||
                    (isPending && act === "borrow") ||
                    (isConfirming && act === "borrow")
                  }
                >
                  {(isPending && act === "borrow") ||
                  (isConfirming && act === "borrow") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  <span className="ml-2">
                    {(isPending && act === "borrow") ||
                    (isConfirming && act === "borrow")
                      ? "Borrowing…"
                      : "Borrow USDC"}
                  </span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[12px] text-neutral-500 dark:text-neutral-400 mb-1">
                    <span>Amount</span>
                    <span className="inline-flex items-center gap-1">
                      Debt: {formatUSDC(currentDebt)}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="pr-20 h-10 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 dark:text-white"
                        onClick={() => {
                          const buf = parseUSDC("0.5");
                          const max = currentDebt + buf;
                          const bal =
                            typeof usdcBalance === "bigint"
                              ? usdcBalance
                              : BigInt(0);
                          setRepayAmount(formatUSDC(max < bal ? max : bal));
                        }}
                      >
                        MAX
                      </Button>
                      <Image
                        src="/images/LogoCoin/usd-coin-usdc-logo.png"
                        alt="USDC"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                </div>

                {needsApproval && (
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={async () => {
                      if (!repayAmount) return;
                      setAct("approve-usdc");
                      await approveUSDC(parseUSDC(repayAmount));
                    }}
                    disabled={
                      !repayAmount ||
                      (isPending && act === "approve-usdc") ||
                      (isConfirming && act === "approve-usdc")
                    }
                  >
                    {(isPending && act === "approve-usdc") ||
                    (isConfirming && act === "approve-usdc") ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span className="ml-2">Approve USDC</span>
                  </Button>
                )}

                <Button
                  className="w-full h-10"
                  onClick={async () => {
                    if (!repayAmount) return;
                    setAct("repay");
                    await repay(parseUSDC(repayAmount));
                  }}
                  disabled={
                    !repayAmount ||
                    needsApproval ||
                    (isPending && act === "repay") ||
                    (isConfirming && act === "repay")
                  }
                >
                  {(isPending && act === "repay") ||
                  (isConfirming && act === "repay") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {(isPending && act === "repay") ||
                    (isConfirming && act === "repay")
                      ? "Repaying…"
                      : "Repay USDC"}
                  </span>
                </Button>
              </div>
            )}
          </>
        )}

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">
              Total Borrowed
            </div>
            <div className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100 inline-flex items-center gap-1">
              {formatUSDC(poolData.totalDebt)}
              <Image
                src="/images/LogoCoin/usd-coin-usdc-logo.png"
                alt="USDC"
                width={14}
                height={14}
              />
            </div>
          </div>
          <div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">
              LTV
            </div>
            <div className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
              {(poolData.ltvBps / 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {hasCol && (
          <div className="mt-5 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-700 p-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-neutral-600 dark:text-neutral-300">
                Borrowed
              </span>
              <span className="font-medium inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                {formatUSDC(currentDebt)}
                <Image
                  src="/images/LogoCoin/usd-coin-usdc-logo.png"
                  alt="USDC"
                  width={12}
                  height={12}
                />
              </span>
            </div>
            <div className="flex justify-between text-[13px] mt-1">
              <span className="text-neutral-600 dark:text-neutral-300">
                Health Factor
              </span>
              <span className={hfClass(userPosition.healthFactor)}>
                {formatHealthFactor(userPosition.healthFactor)}
              </span>
            </div>
            <div className="flex justify-between text-[13px] mt-1">
              <span className="text-neutral-600 dark:text-neutral-300">
                Max Borrowable
              </span>
              <span className="font-medium inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                {formatUSDC(userPosition.maxBorrowable)}
                <Image
                  src="/images/LogoCoin/usd-coin-usdc-logo.png"
                  alt="USDC"
                  width={12}
                  height={12}
                />
              </span>
            </div>
          </div>
        )}

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
