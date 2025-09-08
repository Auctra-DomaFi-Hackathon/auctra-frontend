"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useLendingPool, formatUSDC, parseUSDC } from "@/hooks/useLendingPool";
import { useAccount } from "wagmi";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SupplyPanelProps {
  className?: string;
}

export default function SupplyPanel({ className }: SupplyPanelProps) {
  const { isConnected } = useAccount();
  const {
    poolData,
    userPosition,
    usdcBalance,
    usdcAllowance,
    approveUSDC,
    depositLiquidity,
    withdrawLiquidity,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  } = useLendingPool();

  const [supplyAmount, setSupplyAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [tab, setTab] = useState<"supply" | "withdraw">("supply");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [act, setAct] = useState<"approve" | "supply" | "withdraw" | null>(
    null
  );

  useEffect(() => {
    if (supplyAmount && typeof usdcAllowance === "bigint") {
      setNeedsApproval(parseUSDC(supplyAmount) > usdcAllowance);
    } else {
      setNeedsApproval(false);
    }
  }, [supplyAmount, usdcAllowance]);

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
    if (!isConfirmed || !act || !hash) return;
    toast({
      title:
        act === "approve"
          ? "USDC Approved"
          : act === "supply"
          ? "Supplied"
          : "Withdrawn",
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
    if (act === "supply") setSupplyAmount("");
    if (act === "withdraw") setWithdrawAmount("");
    setAct(null);
    if (act === "approve") setNeedsApproval(false);
  }, [isConfirmed, act, hash]);

  const apr = (() => {
    const util = Number(poolData.utilization1e18) / 1e18;
    const borrowRate = poolData.aprBps / 100;
    const rf = 0.1;
    return `${(borrowRate * util * (1 - rf)).toFixed(1)}%`;
  })();

  const userSupplied = (() => {
    if (!userPosition.shares || !poolData.exchangeRate) return "0";
    const amt =
      (userPosition.shares * poolData.exchangeRate) /
      BigInt("1000000000000000000");
    return formatUSDC(amt);
  })();

  const maxWithdraw = () => {
    if (!userPosition.shares || !poolData.exchangeRate) return "0";
    const amt =
      (userPosition.shares * poolData.exchangeRate) /
      BigInt("1000000000000000000");
    return formatUSDC(amt);
  };

  if (!isConnected) {
    return (
      <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <Image
              src="/images/LogoCoin/usd-coin-usdc-logo.png"
              alt="USDC"
              width={40}
              height={40}
              className="mx-auto mb-3"
            />
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Connect your wallet to supply USDC
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
            Supply USDC
          </CardTitle>
          <Badge className="gap-1 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/50">
            <TrendingUp className="h-3 w-3" />
            {apr}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-2 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-700 overflow-hidden mb-4">
          <Button
            onClick={() => setTab("supply")}
            variant={tab === "supply" ? "default" : "ghost"}
            className={cn(
              "h-8 rounded-none",
              tab !== "supply" &&
                "bg-transparent text-gray-700 dark:text-gray-300"
            )}
          >
            Supply
          </Button>
          <Button
            onClick={() => setTab("withdraw")}
            variant={tab === "withdraw" ? "default" : "ghost"}
            className={cn(
              "h-8 rounded-none",
              tab !== "withdraw" &&
                "bg-transparent text-gray-700 dark:text-gray-300"
            )}
          >
            Withdraw
          </Button>
        </div>

        {tab === "supply" ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[12px] text-neutral-500 dark:text-neutral-400 mb-1">
                <span>Amount</span>
                <span className="inline-flex items-center gap-1">
                  Bal:{" "}
                  {formatUSDC(
                    typeof usdcBalance === "bigint" ? usdcBalance : BigInt(0)
                  )}
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={12}
                    height={12}
                  />
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={supplyAmount}
                  onChange={(e) => setSupplyAmount(e.target.value)}
                  className="pr-20 h-10 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 dark:text-white"
                    onClick={() =>
                      typeof usdcBalance === "bigint" &&
                      setSupplyAmount(formatUSDC(usdcBalance))
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

            {needsApproval && (
              <Button
                variant="outline"
                className="w-full h-10"
                onClick={async () => {
                  if (!supplyAmount) return;
                  setAct("approve");
                  await approveUSDC(parseUSDC(supplyAmount));
                }}
                disabled={
                  !supplyAmount ||
                  (isPending && act === "approve") ||
                  (isConfirming && act === "approve")
                }
              >
                {(isPending && act === "approve") ||
                (isConfirming && act === "approve") ? (
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
                if (!supplyAmount) return;
                setAct("supply");
                await depositLiquidity(parseUSDC(supplyAmount));
              }}
              disabled={
                !supplyAmount ||
                needsApproval ||
                (isPending && act === "supply") ||
                (isConfirming && act === "supply")
              }
            >
              {(isPending && act === "supply") ||
              (isConfirming && act === "supply") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span className="ml-2">
                {(isPending && act === "supply") ||
                (isConfirming && act === "supply")
                  ? "Supplying…"
                  : "Supply"}
              </span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[12px] text-neutral-500 dark:text-neutral-400 mb-1">
                <span>Amount</span>
                <span className="inline-flex items-center gap-1">
                  Supplied: {userSupplied}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pr-20 h-10 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 dark:text-white"
                    onClick={() => setWithdrawAmount(maxWithdraw())}
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

            <Button
              className="w-full h-10"
              onClick={async () => {
                if (!withdrawAmount) return;
                setAct("withdraw");
                await withdrawLiquidity(parseUSDC(withdrawAmount));
              }}
              disabled={
                !withdrawAmount ||
                (isPending && act === "withdraw") ||
                (isConfirming && act === "withdraw")
              }
            >
              {(isPending && act === "withdraw") ||
              (isConfirming && act === "withdraw") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span className="ml-2">
                {(isPending && act === "withdraw") ||
                (isConfirming && act === "withdraw")
                  ? "Withdrawing…"
                  : "Withdraw"}
              </span>
            </Button>
          </div>
        )}

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">
              Total Supplied
            </div>
            <div className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100 inline-flex items-center gap-1">
              {formatUSDC(poolData.totalAssets)}
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
              Utilization
            </div>
            <div className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
              {((Number(poolData.utilization1e18) / 1e18) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {userPosition.shares > BigInt(0) && (
          <div className="mt-5 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-700 p-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-neutral-600 dark:text-white">
                Your Supply
              </span>
              <span className="font-medium inline-flex items-center gap-1 text-neutral-600 dark:text-white">
                {userSupplied}
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
