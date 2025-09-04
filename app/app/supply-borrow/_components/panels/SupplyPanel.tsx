"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Coins,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import {
  useLendingPool,
  formatUSDC,
  parseUSDC,
  formatAPR,
} from "@/hooks/useLendingPool";
import { useAccount } from "wagmi";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SupplyPanelProps {
  className?: string;
}

export default function SupplyPanel({ className }: SupplyPanelProps) {
  const { address, isConnected } = useAccount();
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
  const [isSupplyMode, setIsSupplyMode] = useState(true);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    "approve" | "supply" | "withdraw" | null
  >(null);

  // Check if approval is needed
  useEffect(() => {
    if (
      supplyAmount &&
      usdcAllowance !== undefined &&
      typeof usdcAllowance === "bigint"
    ) {
      const amount = parseUSDC(supplyAmount);
      setNeedsApproval(amount > usdcAllowance);
    } else {
      setNeedsApproval(false);
    }
  }, [supplyAmount, usdcAllowance]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && currentAction && hash) {
      let description = "";
      let title = "";
      switch (currentAction) {
        case "approve":
          title = "USDC Approval Successful";
          description = "Successfully approved USDC spending";
          // Force update approval status after successful approval
          setNeedsApproval(false);
          break;
        case "supply":
          title = "USDC Supply Successful";
          description = "Successfully supplied USDC to the pool";
          break;
        case "withdraw":
          title = "USDC Withdrawal Successful";
          description = "Successfully withdrew USDC from the pool";
          break;
      }

      // Create transaction link
      const txLink = `https://explorer-testnet.doma.xyz/tx/${hash}`;

      toast({
        title,
        description: (
          <div className="space-y-2">
            <p>{description}</p>
            <a
              href={txLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              View Transaction
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        ),
        duration: 8000, // Show longer for transaction link
      });

      // Clear amounts only after successful supply/withdraw, not after approve
      if (currentAction === "supply") {
        setSupplyAmount("");
      } else if (currentAction === "withdraw") {
        setWithdrawAmount("");
      }

      // Reset current action
      setCurrentAction(null);
    }
  }, [isConfirmed, currentAction, hash]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleMaxSupply = () => {
    if (usdcBalance && typeof usdcBalance === "bigint") {
      setSupplyAmount(formatUSDC(usdcBalance));
    }
  };

  const handleMaxWithdraw = () => {
    if (userPosition.shares && poolData.exchangeRate) {
      const maxWithdrawable =
        (userPosition.shares * poolData.exchangeRate) /
        BigInt("1000000000000000000");
      setWithdrawAmount(formatUSDC(maxWithdrawable));
    }
  };

  const handleApprove = async () => {
    if (!supplyAmount) return;
    const amount = parseUSDC(supplyAmount);
    setCurrentAction("approve");
    await approveUSDC(amount);
  };

  const handleSupply = async () => {
    if (!supplyAmount) return;
    const amount = parseUSDC(supplyAmount);
    setCurrentAction("supply");
    await depositLiquidity(amount);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    const amount = parseUSDC(withdrawAmount);
    setCurrentAction("withdraw");
    await withdrawLiquidity(amount);
  };

  const getSupplyAPR = () => {
    // Calculate supply APR based on utilization and current rate
    const utilizationRate = Number(poolData.utilization1e18) / 1e18;
    const borrowRate = poolData.aprBps / 100;
    const reserveFactor = 0.1; // 10% reserve factor (could be read from contract)

    return (
      (borrowRate * utilizationRate * (1 - reserveFactor)).toFixed(1) + "%"
    );
  };

  const getUserSuppliedAmount = () => {
    if (userPosition.shares && poolData.exchangeRate) {
      const suppliedAmount =
        (userPosition.shares * poolData.exchangeRate) /
        BigInt("1000000000000000000");
      return formatUSDC(suppliedAmount);
    }
    return "0";
  };

  if (!isConnected) {
    return (
      <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Image
              src="/images/LogoCoin/usd-coin-usdc-logo.png"
              alt="USDC"
              width={48}
              height={48}
              className="mx-auto mb-4 opacity-60"
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              Connect your wallet to start earning with
              <Image
                src="/images/LogoCoin/usd-coin-usdc-logo.png"
                alt="USDC"
                width={14}
                height={14}
                className="rounded-full"
              />
              USDC
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("dark:bg-gray-800 dark:border-gray-700", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-xl">
            <Image
              src="/images/LogoCoin/usd-coin-usdc-logo.png"
              alt="USDC"
              width={20}
              height={20}
              className="rounded-full"
            />
            Supply USDC & Earn
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {getSupplyAPR()} APR
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button
            variant={isSupplyMode ? "default" : "outline"}
            onClick={() => setIsSupplyMode(true)}
            className="w-full"
          >
            Supply
          </Button>
          <Button
            variant={!isSupplyMode ? "default" : "outline"}
            onClick={() => setIsSupplyMode(false)}
            className="w-full"
          >
            Withdraw
          </Button>
        </div>

        {isSupplyMode ? (
          // Supply Mode
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supply Amount
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  Balance:{" "}
                  {formatUSDC(
                    typeof usdcBalance === "bigint" ? usdcBalance : BigInt(0)
                  )}
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={10}
                    height={10}
                    className="rounded-full"
                  />
                  USDC
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={supplyAmount}
                  onChange={(e) => setSupplyAmount(e.target.value)}
                  className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxSupply}
                    className="h-6 px-2 text-xs"
                  >
                    MAX
                  </Button>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Image
                      src="/images/LogoCoin/usd-coin-usdc-logo.png"
                      alt="USDC"
                      width={12}
                      height={12}
                      className="rounded-full"
                    />
                    USDC
                  </span>
                </div>
              </div>
            </div>

            {supplyAmount && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    You will earn
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {getSupplyAPR()} APR
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {needsApproval && (
                <Button
                  onClick={handleApprove}
                  disabled={
                    !supplyAmount ||
                    (isPending && currentAction === "approve") ||
                    (isConfirming && currentAction === "approve")
                  }
                  className="w-full"
                  variant="outline"
                >
                  {(isPending && currentAction === "approve") ||
                  (isConfirming && currentAction === "approve") ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isPending ? "Approving..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve USDC
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleSupply}
                disabled={
                  !supplyAmount ||
                  (isPending && currentAction === "supply") ||
                  (isConfirming && currentAction === "supply") ||
                  needsApproval
                }
                className="w-full"
              >
                {(isPending && currentAction === "supply") ||
                (isConfirming && currentAction === "supply") ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPending ? "Supplying..." : "Confirming..."}
                  </>
                ) : (
                  <>
                    <Image
                      src="/images/LogoCoin/usd-coin-usdc-logo.png"
                      alt="USDC"
                      width={16}
                      height={16}
                      className="mr-2 rounded-full"
                    />
                    Supply USDC
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Withdraw Mode
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Withdraw Amount
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  Supplied: {getUserSuppliedAmount()}
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={10}
                    height={10}
                    className="rounded-full"
                  />
                  USDC
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxWithdraw}
                    className="h-6 px-2 text-xs"
                  >
                    MAX
                  </Button>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Image
                      src="/images/LogoCoin/usd-coin-usdc-logo.png"
                      alt="USDC"
                      width={12}
                      height={12}
                      className="rounded-full"
                    />
                    USDC
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={
                !withdrawAmount ||
                (isPending && currentAction === "withdraw") ||
                (isConfirming && currentAction === "withdraw")
              }
              className="w-full"
            >
              {(isPending && currentAction === "withdraw") ||
              (isConfirming && currentAction === "withdraw") ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending ? "Withdrawing..." : "Confirming..."}
                </>
              ) : (
                <>
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={16}
                    height={16}
                    className="mr-2 rounded-full"
                  />
                  Withdraw USDC
                </>
              )}
            </Button>
          </div>
        )}

        <Separator className="my-6" />

        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Supplied
            </div>
            <div className="font-semibold flex items-center justify-center gap-1 text-gray-900 dark:text-white">
              <span>{formatUSDC(poolData.totalAssets)}</span>
              USDC
              <Image
                src="/images/LogoCoin/usd-coin-usdc-logo.png"
                alt="USDC"
                width={18}
                height={12}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Utilization
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {((Number(poolData.utilization1e18) / 1e18) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Your Position */}
        {userPosition.shares > BigInt(0) && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">
              Your Supply Position
            </h5>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Supplied Amount
              </span>
              <span className="font-medium flex items-center gap-1 text-gray-900 dark:text-white">
                <span>{getUserSuppliedAmount()}</span>
                USDC
                <Image
                  src="/images/LogoCoin/usd-coin-usdc-logo.png"
                  alt="USDC"
                  width={15}
                  height={10}
                  className="rounded-full"
                />
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">
                Current APR
              </span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getSupplyAPR()}
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
