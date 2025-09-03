"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Shield,
  Globe,
} from "lucide-react";
import Image from "next/image";
import {
  useLendingPool,
  formatUSDC,
  parseUSDC,
  formatAPR,
  formatHealthFactor,
} from "@/hooks/useLendingPool";
import { useAccount } from "wagmi";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@apollo/client";
import { GET_NAME_FROM_TOKEN_QUERY } from "@/lib/graphql/queries";
import { apolloClient } from "@/lib/graphql/client";
import type {
  NameFromTokenResponse,
  NameFromTokenVariables,
  NFTMetadata,
} from "@/lib/graphql/types";
import DomainSelector from "../domains/DomainSelector";
import type { EnhancedDomainItem } from "@/lib/graphql/services";
import { CONTRACTS } from "@/hooks/contracts/constants";

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

  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [isBorrowMode, setIsBorrowMode] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<
    EnhancedDomainItem | undefined
  >();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [nftApproved, setNftApproved] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    | "approve-nft"
    | "deposit"
    | "approve-usdc"
    | "borrow"
    | "repay"
    | "withdraw"
    | null
  >(null);
  const [collateralMetadata, setCollateralMetadata] =
    useState<NFTMetadata | null>(null);

  // Define computed values first
  const hasCollateral = userPosition.collateral.active;
  const hasDebt = userPosition.debt.principal > BigInt(0);

  // Function to fetch NFT metadata from tokenId using Doma API
  const fetchNFTMetadata = async (tokenId: string): Promise<NFTMetadata> => {
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
      if (name) {
        // Split domain name to get SLD and TLD
        const [sld, tld] = name.split(".");
        return {
          name: sld || name,
          tld: tld ? `.${tld}` : ".doma",
          description: `Domain: ${name}`,
        };
      } else {
        // Fallback if name not found
        return {
          name: `Domain-${tokenId.slice(-8)}`,
          tld: ".doma",
          description: `Domain NFT #${tokenId}`,
        };
      }
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
      return {
        name: `Domain-${tokenId.slice(-8)}`,
        tld: ".doma",
        description: `Domain NFT #${tokenId}`,
      };
    }
  };

  // Fetch collateral metadata when collateral is active
  useEffect(() => {
    if (hasCollateral && userPosition.collateral.tokenId) {
      const tokenId = userPosition.collateral.tokenId.toString();
      fetchNFTMetadata(tokenId).then(setCollateralMetadata);
    } else {
      setCollateralMetadata(null);
    }
  }, [hasCollateral, userPosition.collateral.tokenId]);

  const getDomainName = () => {
    if (!hasCollateral || !userPosition.collateral.tokenId) return null;

    if (collateralMetadata?.name) {
      const fullName = collateralMetadata.tld
        ? `${collateralMetadata.name}${collateralMetadata.tld}`
        : collateralMetadata.name;
      return fullName;
    }

    // Fallback to formatted token ID if metadata not loaded yet
    return `Domain #${userPosition.collateral.tokenId.toString().slice(-6)}`;
  };

  // Check if approval is needed for repay
  useEffect(() => {
    if (repayAmount && typeof usdcAllowance === "bigint" && !isBorrowMode) {
      const amount = parseUSDC(repayAmount);
      setNeedsApproval(amount > usdcAllowance);
    } else {
      setNeedsApproval(false);
    }
  }, [repayAmount, usdcAllowance, isBorrowMode]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && currentAction && hash) {
      let description = "";
      let title = "";
      switch (currentAction) {
        case "approve-nft":
          title = "NFT Approval Successful";
          description = "Successfully approved NFT for collateral";
          setNftApproved(true);
          break;
        case "deposit":
          title = "Collateral Deposit Successful";
          description = "Successfully deposited collateral";
          setSelectedDomain(undefined);
          setNftApproved(false);
          break;
        case "approve-usdc":
          title = "USDC Approval Successful";
          description = "Successfully approved USDC spending";
          break;
        case "borrow":
          title = "USDC Borrow Successful";
          description = "Successfully borrowed USDC";
          setBorrowAmount("");
          break;
        case "repay":
          title = "USDC Repayment Successful";
          description = "Successfully repaid USDC";
          setRepayAmount("");
          break;
        case "withdraw":
          title = "Collateral Withdrawal Successful";
          description = "Successfully withdrew collateral";
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

  const handleMaxBorrow = () => {
    if (userPosition.maxBorrowable) {
      setBorrowAmount(formatUSDC(userPosition.maxBorrowable));
    }
  };

  const handleMaxRepay = () => {
    if (userPosition.debt.principal && typeof usdcBalance === "bigint") {
      const maxRepay =
        userPosition.debt.principal < usdcBalance
          ? userPosition.debt.principal
          : usdcBalance;
      setRepayAmount(formatUSDC(maxRepay));
    }
  };

  const handleApproveNFT = async () => {
    if (
      !selectedDomain ||
      !selectedDomain.tokenId ||
      !selectedDomain.tokenAddress
    )
      return;

    try {
      setCurrentAction("approve-nft");
      await approveNFT(
        selectedDomain.tokenAddress,
        BigInt(selectedDomain.tokenId)
      );
    } catch (error) {
      console.error("Failed to approve NFT:", error);
    }
  };

  const handleDepositCollateral = async () => {
    if (
      !selectedDomain ||
      !selectedDomain.tokenId ||
      !selectedDomain.tokenAddress
    )
      return;

    try {
      setCurrentAction("deposit");
      await depositCollateral(
        CONTRACTS.DomainNFT,
        BigInt(selectedDomain.tokenId)
      );
    } catch (error) {
      console.error("Failed to deposit collateral:", error);
    }
  };

  const handleWithdrawCollateral = async () => {
    setCurrentAction("withdraw");
    await withdrawCollateral();
  };

  const handleApprove = async () => {
    if (!repayAmount) return;
    const amount = parseUSDC(repayAmount);
    setCurrentAction("approve-usdc");
    await approveUSDC(amount);
  };

  const handleBorrow = async () => {
    if (!borrowAmount) return;
    const amount = parseUSDC(borrowAmount);
    setCurrentAction("borrow");
    await borrow(amount);
  };

  const handleRepay = async () => {
    if (!repayAmount) return;
    const amount = parseUSDC(repayAmount);
    setCurrentAction("repay");
    await repay(amount);
  };

  const getBorrowAPR = () => {
    return formatAPR(poolData.aprBps);
  };

  const calculateNewHealthFactor = () => {
    if (!borrowAmount || !userPosition.collateral.active)
      return userPosition.healthFactor;

    const currentDebt = userPosition.debt.principal;
    const newDebt = currentDebt + parseUSDC(borrowAmount);
    const collateralValue = userPosition.collateral.valueUsd6;
    const liquidationThreshold = BigInt(poolData.liqThresholdBps);

    if (newDebt === BigInt(0)) return BigInt(0); // Infinite health factor

    const numerator = (collateralValue * liquidationThreshold) / BigInt(10000);
    const denominator = newDebt;

    return (numerator * BigInt("1000000000000000000")) / denominator;
  };

  const getHealthFactorColor = (hf: bigint) => {
    const healthFactor = Number(hf) / 1e18;
    if (healthFactor >= 2) return "text-green-600";
    if (healthFactor >= 1.5) return "text-yellow-600";
    if (healthFactor >= 1.2) return "text-orange-600";
    return "text-red-600";
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 flex items-center justify-center gap-1">
              Connect your wallet to start borrowing
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
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Borrow USDC
            <Image
              src="/images/LogoCoin/usd-coin-usdc-logo.png"
              alt="USDC"
              width={20}
              height={16}
              className="rounded-full"
            />
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <TrendingDown className="h-3 w-3 mr-1" />
            {getBorrowAPR()} APR
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {/* Collateral Status */}
        {!hasCollateral ? (
          <div className="mb-6">
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">
                    No Collateral Deposited
                  </h4>
                  <p className="text-sm text-amber-700 flex items-center gap-1">
                    Select and deposit a premium domain NFT as collateral to
                    borrow
                    <Image
                      src="/images/LogoCoin/usd-coin-usdc-logo.png"
                      alt="USDC"
                      width={12}
                      height={12}
                      className="rounded-full"
                    />
                    USDC.
                  </p>
                </div>
              </div>
            </div>

            {/* Domain Selector */}
            <div className="mb-4">
              <DomainSelector
                onDomainSelect={setSelectedDomain}
                selectedDomain={selectedDomain}
                disabled={isPending || isConfirming}
              />
            </div>

            {/* NFT Approve and Deposit Buttons */}
            {selectedDomain && (
              <div className="space-y-3">
                {!nftApproved && (
                  <Button
                    onClick={handleApproveNFT}
                    disabled={
                      (isPending && currentAction === "approve-nft") ||
                      (isConfirming && currentAction === "approve-nft")
                    }
                    className="w-full"
                    variant="outline"
                  >
                    {(isPending && currentAction === "approve-nft") ||
                    (isConfirming && currentAction === "approve-nft") ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isPending ? "Approving NFT..." : "Confirming..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve NFT for Collateral
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={handleDepositCollateral}
                  disabled={
                    !nftApproved ||
                    (isPending && currentAction === "deposit") ||
                    (isConfirming && currentAction === "deposit")
                  }
                  className="w-full"
                >
                  {(isPending && currentAction === "deposit") ||
                  (isConfirming && currentAction === "deposit") ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isPending ? "Depositing..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Use {selectedDomain?.name.split(".")[0]} as Collateral
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 mb-1">
                    Collateral Active
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                      {collateralMetadata ? (
                        getDomainName()
                      ) : (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Loading domain name...
                        </>
                      )}
                    </p>
                    <p className="text-sm text-green-700">
                      Token ID:{" "}
                      {(() => {
                        const tokenId =
                          userPosition.collateral.tokenId.toString();
                        if (tokenId.length > 20) {
                          return `${tokenId.slice(0, 10)}....${tokenId.slice(
                            -11
                          )}`;
                        }
                        return tokenId;
                      })()}
                    </p>
                    <p className="text-sm text-green-700">
                      Value: ${formatUSDC(userPosition.collateral.valueUsd6)}
                    </p>
                  </div>
                </div>
              </div>
              {!hasDebt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWithdrawCollateral}
                  disabled={
                    (isPending && currentAction === "withdraw") ||
                    (isConfirming && currentAction === "withdraw")
                  }
                >
                  {(isPending && currentAction === "withdraw") ||
                  (isConfirming && currentAction === "withdraw") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {hasCollateral && (
          <>
            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button
                variant={isBorrowMode ? "default" : "outline"}
                onClick={() => setIsBorrowMode(true)}
                className="w-full"
              >
                Borrow
              </Button>
              <Button
                variant={!isBorrowMode ? "default" : "outline"}
                onClick={() => setIsBorrowMode(false)}
                className="w-full"
              >
                Repay
              </Button>
            </div>

            {isBorrowMode ? (
              // Borrow Mode
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Borrow Amount
                    </label>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      Max: {formatUSDC(userPosition.maxBorrowable)}
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
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMaxBorrow}
                        className="h-6 px-2 text-xs"
                      >
                        MAX
                      </Button>
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
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

                {borrowAmount && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Borrow APR</span>
                      <span className="font-medium text-purple-600">
                        {getBorrowAPR()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">New Health Factor</span>
                      <span
                        className={`font-medium ${getHealthFactorColor(
                          calculateNewHealthFactor()
                        )}`}
                      >
                        {formatHealthFactor(calculateNewHealthFactor())}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBorrow}
                  disabled={
                    !borrowAmount ||
                    (isPending && currentAction === "borrow") ||
                    (isConfirming && currentAction === "borrow")
                  }
                  className="w-full"
                >
                  {(isPending && currentAction === "borrow") ||
                  (isConfirming && currentAction === "borrow") ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isPending ? "Borrowing..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Borrow
                      <Image
                        src="/images/LogoCoin/usd-coin-usdc-logo.png"
                        alt="USDC"
                        width={14}
                        height={14}
                        className="rounded-full mx-1"
                      />
                      USDC
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Repay Mode
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Repay Amount
                    </label>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      Debt: {formatUSDC(userPosition.debt.principal)}
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
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMaxRepay}
                        className="h-6 px-2 text-xs"
                      >
                        MAX
                      </Button>
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
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

                <div className="space-y-3">
                  {needsApproval && (
                    <Button
                      onClick={handleApprove}
                      disabled={
                        !repayAmount ||
                        (isPending && currentAction === "approve-usdc") ||
                        (isConfirming && currentAction === "approve-usdc")
                      }
                      className="w-full"
                      variant="outline"
                    >
                      {(isPending && currentAction === "approve-usdc") ||
                      (isConfirming && currentAction === "approve-usdc") ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isPending ? "Approving..." : "Confirming..."}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                          <Image
                            src="/images/LogoCoin/usd-coin-usdc-logo.png"
                            alt="USDC"
                            width={14}
                            height={14}
                            className="rounded-full mx-1"
                          />
                          USDC
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={handleRepay}
                    disabled={
                      !repayAmount ||
                      (isPending && currentAction === "repay") ||
                      (isConfirming && currentAction === "repay") ||
                      needsApproval
                    }
                    className="w-full"
                  >
                    {(isPending && currentAction === "repay") ||
                    (isConfirming && currentAction === "repay") ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isPending ? "Repaying..." : "Confirming..."}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Repay
                        <Image
                          src="/images/LogoCoin/usd-coin-usdc-logo.png"
                          alt="USDC"
                          width={14}
                          height={14}
                          className="rounded-full mx-1"
                        />
                        USDC
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <Separator className="my-6" />

        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Borrowed</div>
            <div className="font-semibold flex items-center justify-center gap-1">
              <span>{formatUSDC(poolData.totalDebt)}</span>
              USDC
              <Image
                src="/images/LogoCoin/usd-coin-usdc-logo.png"
                alt="USDC"
                width={12}
                height={12}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">LTV Ratio</div>
            <div className="font-semibold">
              {(poolData.ltvBps / 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Your Position */}
        {hasCollateral && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your Borrow Position
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Collateral Value</span>
                <span className="font-medium">
                  ${formatUSDC(userPosition.collateral.valueUsd6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Borrowed Amount</span>
                <span className="font-medium flex items-center gap-1">
                  {formatUSDC(userPosition.debt.principal)}
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
              <div className="flex justify-between">
                <span className="text-gray-600">Health Factor</span>
                <span
                  className={`font-medium ${getHealthFactorColor(
                    userPosition.healthFactor
                  )}`}
                >
                  {formatHealthFactor(userPosition.healthFactor)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Borrowable</span>
                <span className="font-medium flex items-center gap-1">
                  {formatUSDC(userPosition.maxBorrowable)}
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
