"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatEther } from "ethers";
import { isAddressEqual, zeroAddress, parseEther } from "viem";
import { usePublicClient } from "wagmi";
import {
  usePlaceBid,
  useDutchAuctionPurchase,
  useCommitSealedBid,
  useGetSealedBidPhase,
  useGetHighestBid,
  getSealedBidParams,
  type SealedBidParams,
} from "@/hooks/useAuction";
import { CONTRACTS } from "@/hooks/contracts/constants";
import { getStrategyName } from "@/lib/utils/strategy";
import { formatTransactionError } from "@/lib/utils/auction";
import BidSuccessDialog from "./BidSuccessDialog";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";
import { DOMAIN_AUCTION_HOUSE_ABI } from "@/hooks";

interface BidDialogProps {
  isOpen: boolean;
  onClose: (forceReset?: boolean) => void;
  listing: (Listing & { metadata?: NFTMetadata }) | null;
}

function BidDialogInner({ isOpen, onClose, listing }: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState(""); // For sealed bid
  const [error, setError] = useState("");
  const [bidValidationError, setBidValidationError] = useState(""); // For bid validation errors
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successBidAmount, setSuccessBidAmount] = useState("");
  const [successBidType, setSuccessBidType] = useState<
    "bid" | "purchase" | "commit"
  >("bid");
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for immediate feedback

  // Manual transaction tracking - independent of wagmi state
  const [manualTransactionStates, setManualTransactionStates] = useState<{
    [key: string]: {
      isSuccess: boolean;
      hash: string;
      bidAmount: string;
      bidType: string;
      timestamp: number;
    };
  }>({});

  // Generate unique key for each bid attempt
  const [currentBidKey, setCurrentBidKey] = useState<string | null>(null);

  // Hooks for different auction types
  const {
    placeBidEnglish,
    isPending: englishPending,
    isSuccess: englishSuccess,
    hash: englishHash,
  } = usePlaceBid();
  const {
    purchaseDutchAuction,
    isPending: dutchPending,
    isSuccess: dutchSuccess,
    hash: dutchHash,
  } = useDutchAuctionPurchase();
  const {
    commitBid,
    isPending: sealedPending,
    isSuccess: sealedSuccess,
    hash: sealedHash,
  } = useCommitSealedBid();
  const { getSealedBidPhase } = useGetSealedBidPhase();
  const { getHighestBid } = useGetHighestBid();
  const publicClient = usePublicClient();

  // Sealed bid specific state
  const [sealedBidPhase, setSealedBidPhase] = useState<{
    phase: number;
    phaseDescription: string;
    timeRemaining: number;
    error?: string;
  } | null>(null);

  const [sealedBidParams, setSealedBidParams] =
    useState<SealedBidParams | null>(null);
  const [minDepositError, setMinDepositError] = useState<string | null>(null);

  // Payment token state for CLAUDE.md implementation
  const [paymentTokenInfo, setPaymentTokenInfo] = useState<{
    paymentToken: `0x${string}`;
    isETH: boolean;
    symbol: string;
  } | null>(null);

  // Highest bid state for English auctions
  const [highestBid, setHighestBid] = useState<{
    bidder: `0x${string}`;
    amount: bigint;
  } | null>(null);

  // Current price state for Dutch auctions
  const [currentPrice, setCurrentPrice] = useState<bigint | null>(null);
  const [currentPriceError, setCurrentPriceError] = useState<string | null>(
    null
  );

  // Handle success states
  const isLoading = englishPending || dutchPending || sealedPending;
  const isSuccessful = englishSuccess || dutchSuccess || sealedSuccess;
  const successHash = englishSuccess
    ? englishHash
    : dutchSuccess
    ? dutchHash
    : sealedSuccess
    ? sealedHash
    : undefined;

  // Get strategy info
  const strategyName = listing ? getStrategyName(listing.strategy) : "";
  const isEnglish = strategyName === "English Auction";
  const isDutch = strategyName === "Dutch Auction";
  const isSealed = strategyName === "Sealed Bid Auction";
  const isStrategySet =
    listing?.strategy &&
    listing.strategy !== "0x0000000000000000000000000000000000000000";

  // Track wagmi success states and convert to manual tracking
  useEffect(() => {
    console.log("🔍 Wagmi State Check:", {
      isSuccessful,
      isLoading,
      successHash,
      currentBidKey,
      manualStates: Object.keys(manualTransactionStates),
    });

    // Convert wagmi success to manual tracking
    if (isSuccessful && !isLoading && successHash && currentBidKey) {
      const existingState = manualTransactionStates[currentBidKey];

      if (!existingState || !existingState.isSuccess) {
        console.log("✅ Recording new successful transaction:", currentBidKey);

        const newState = {
          isSuccess: true,
          hash: successHash,
          bidAmount: bidAmount || depositAmount,
          bidType: isDutch ? "purchase" : isSealed ? "commit" : "bid",
          timestamp: Date.now(),
        };

        setManualTransactionStates((prev) => ({
          ...prev,
          [currentBidKey]: newState,
        }));

        // Clear any previous success state before showing new one
        setShowSuccessDialog(false);
        setTimeout(() => {
          console.log("✅ Showing success dialog for:", currentBidKey);
          setShowSuccessDialog(true);
          setSuccessBidAmount(newState.bidAmount);
          setSuccessBidType(newState.bidType as "bid" | "purchase" | "commit");
        }, 100);
      }
    }
  }, [
    isSuccessful,
    isLoading,
    successHash,
    currentBidKey,
    bidAmount,
    depositAmount,
    isDutch,
    isSealed,
    manualTransactionStates,
  ]);

  // Show success dialog based on manual tracking instead of wagmi state
  useEffect(() => {
    if (!currentBidKey) return;

    const currentState = manualTransactionStates[currentBidKey];
    console.log("🎭 Manual State Check:", {
      currentBidKey,
      currentState,
      showSuccessDialog,
    });

    if (currentState && currentState.isSuccess && !showSuccessDialog) {
      console.log("✅ Showing success dialog from manual tracking");
      setShowSuccessDialog(true);
      setSuccessBidAmount(currentState.bidAmount);
      setSuccessBidType(currentState.bidType as "bid" | "purchase" | "commit");
    }
  }, [currentBidKey, manualTransactionStates, showSuccessDialog]);

  // Reset function to clear all state
  const resetDialogState = () => {
    console.log("🔄 Resetting all dialog state");
    setBidAmount("");
    setDepositAmount("");
    setError("");
    setBidValidationError(""); // Clear bid validation errors
    setShowSuccessDialog(false);
    setSuccessBidAmount("");
    setIsSubmitting(false);
    setCurrentBidKey(null);

    // Clean up old manual transaction states (keep only recent ones)
    const now = Date.now();
    setManualTransactionStates((prev) => {
      const filtered: typeof prev = {};
      Object.entries(prev).forEach(([key, state]) => {
        // Keep states from last 5 minutes only
        if (now - state.timestamp < 5 * 60 * 1000) {
          filtered[key] = state;
        }
      });
      return filtered;
    });
  };

  // Handle dialog open/close state
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens to ensure clean start
      console.log("🚪 Dialog opened, ensuring clean state");
      setShowSuccessDialog(false);
      setSuccessBidAmount("");
      setSuccessBidType("bid");
      setError("");
      setCurrentBidKey(null);
    } else {
      // Also reset when dialog closes
      console.log("🔄 Dialog closed, resetting state");
      resetDialogState();
    }
  }, [isOpen]);

  // Reset submitting state when transaction completes or fails
  useEffect(() => {
    if (!isLoading && (isSuccessful || error)) {
      setIsSubmitting(false);
    }
  }, [isLoading, isSuccessful, error]);

  // Additional effect to handle transaction rejections and timeout scenarios
  useEffect(() => {
    if (isSubmitting) {
      // If user is still in submitting state but wagmi hooks are no longer pending,
      // reset the submitting state after a brief delay
      const timeout = setTimeout(() => {
        if (!englishPending && !dutchPending && !sealedPending) {
          console.log("🔄 Timeout: Resetting isSubmitting state after wagmi hooks reset");
          setIsSubmitting(false);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isSubmitting, englishPending, dutchPending, sealedPending]);

  // Auto-clear old manual states periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setManualTransactionStates((prev) => {
        const filtered: typeof prev = {};
        Object.entries(prev).forEach(([key, state]) => {
          // Keep states from last 10 minutes
          if (now - state.timestamp < 10 * 60 * 1000) {
            filtered[key] = state;
          }
        });
        return Object.keys(filtered).length !== Object.keys(prev).length
          ? filtered
          : prev;
      });
    }, 60000); // Run every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch payment token info and sealed bid parameters when dialog opens
  useEffect(() => {
    const fetchContractData = async () => {
      if (listing && isOpen && publicClient) {
        try {
          console.log("🔍 Fetching contract data for listing:", listing.id);

          // A. Read paymentToken from listing as per CLAUDE.md instructions
          const listingData = await publicClient.readContract({
            address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
            abi: [
              {
                inputs: [{ type: "uint256", name: "listingId" }],
                name: "listings",
                outputs: [
                  { type: "address", name: "seller" },
                  { type: "address", name: "nft" },
                  { type: "uint256", name: "tokenId" },
                  { type: "address", name: "paymentToken" },
                  { type: "uint256", name: "reservePrice" },
                  { type: "uint256", name: "startTime" },
                  { type: "uint256", name: "endTime" },
                  { type: "address", name: "strategy" },
                  { type: "bytes", name: "strategyData" },
                ],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "listings",
            args: [BigInt(listing.id)],
          });

          const listingArray = [...(listingData as readonly any[])];
          const paymentToken = listingArray[3] as `0x${string}`;
          const isETHPayment = isAddressEqual(paymentToken, zeroAddress); // ⬅️ safe address comparison

          // Set payment token info
          setPaymentTokenInfo({
            paymentToken,
            isETH: isETHPayment,
            symbol: isETHPayment ? "ETH" : "ERC20", // TODO: fetch actual symbol for ERC20 tokens
          });

          console.log("💳 Payment token info:", {
            paymentToken,
            isETH: isETHPayment,
            listingId: listing.id,
          });

          // If it's an English auction, fetch highest bid
          if (isEnglish) {
            try {
              const highestBidInfo = await getHighestBid(BigInt(listing.id));
              console.log("🏆 Highest bid info:", highestBidInfo);
              setHighestBid(highestBidInfo);
            } catch (highestBidError) {
              console.error("❌ Error fetching highest bid:", highestBidError);
              setHighestBid({
                bidder:
                  "0x0000000000000000000000000000000000000000" as `0x${string}`,
                amount: BigInt(0),
              });
            }
          }

          // If it's a Dutch auction, fetch current price using previewCurrentPrice
          if (isDutch) {
            try {
              console.log(
                "🔍 Fetching current price via previewCurrentPrice for listing:",
                listing.id
              );

              const currentPriceWei = (await publicClient.readContract({
                address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
                abi: DOMAIN_AUCTION_HOUSE_ABI,
                functionName: "previewCurrentPrice",
                args: [BigInt(listing.id)],
              })) as bigint;

              console.log("💰 Current price via previewCurrentPrice:", {
                wei: currentPriceWei.toString(),
                eth: formatEther(currentPriceWei.toString()),
              });

              setCurrentPrice(currentPriceWei);
              setCurrentPriceError(null);

              // Don't auto-fill bid amount - let user enter their own amount
            } catch (currentPriceError) {
              console.error(
                "❌ Error fetching current price via previewCurrentPrice:",
                currentPriceError
              );
              setCurrentPriceError(
                currentPriceError instanceof Error
                  ? currentPriceError.message
                  : "Failed to fetch current price"
              );
              setCurrentPrice(null);
            }
          }

          // If it's a sealed bid auction, also fetch sealed bid phase and parameters
          if (isSealed) {
            try {
              const phaseInfo = await getSealedBidPhase(BigInt(listing.id));
              console.log("📊 Phase info:", phaseInfo);
              setSealedBidPhase(phaseInfo);

              // Fetch sealed bid parameters
              console.log("💰 Fetching sealed bid parameters...");
              const params = await getSealedBidParams(
                publicClient,
                CONTRACTS.DomainAuctionHouse as `0x${string}`,
                BigInt(listing.id)
              );

              console.log("✅ Sealed bid params:", {
                minDeposit: params.minDeposit.toString(),
                minDepositETH: formatEther(params.minDeposit.toString()),
                commitDuration: params.commitDuration.toString(),
                revealDuration: params.revealDuration.toString(),
              });

              setSealedBidParams(params);
              setMinDepositError(null);
            } catch (sealedError) {
              console.error("❌ Error fetching sealed bid data:", sealedError);
              setSealedBidPhase({
                phase: -1,
                phaseDescription: "ERROR",
                timeRemaining: 0,
                error:
                  sealedError instanceof Error
                    ? sealedError.message
                    : "Unknown error",
              });
              setMinDepositError("Failed to fetch sealed bid parameters");
            }
          }
        } catch (error) {
          console.error("❌ Error fetching contract data:", error);

          if (isSealed) {
            setSealedBidPhase({
              phase: -1,
              phaseDescription: "ERROR",
              timeRemaining: 0,
              error: error instanceof Error ? error.message : "Unknown error",
            });
            setMinDepositError("Failed to fetch contract parameters");
          }
        }
      } else {
        // Reset state when dialog closes or listing changes
        setPaymentTokenInfo(null);
        setSealedBidPhase(null);
        setSealedBidParams(null);
        setMinDepositError(null);
        setHighestBid(null);
      }
    };

    // Add delay to reduce immediate RPC calls when dialog opens
    const timeoutId = setTimeout(fetchContractData, 500);
    return () => clearTimeout(timeoutId);
  }, [
    listing,
    isOpen,
    isSealed,
    isEnglish,
    isDutch,
    getSealedBidPhase,
    getHighestBid,
    publicClient,
  ]);

  if (!listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Generate unique key for this bid attempt
    const bidKey = `bid_${listing.id}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}`;
    setCurrentBidKey(bidKey);

    // Force clear any previous success states and data when starting new bid
    console.log("🚀 Starting new bid with key:", bidKey);
    setShowSuccessDialog(false);
    setSuccessBidAmount("");
    setSuccessBidType("bid");

    // Clear old manual states that might interfere
    setManualTransactionStates((prev) => {
      const filtered: typeof prev = {};
      Object.entries(prev).forEach(([key, state]) => {
        // Only keep very recent states (last 2 minutes)
        if (Date.now() - state.timestamp < 2 * 60 * 1000) {
          filtered[key] = state;
        }
      });
      return filtered;
    });

    if (!isStrategySet) {
      setError("Strategy not set yet. Cannot place bid.");
      setIsSubmitting(false);
      return;
    }

    try {
      const listingId = BigInt(listing.id);

      if (isEnglish) {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError("Please enter a valid bid amount");
          setIsSubmitting(false);
          return;
        }

        // Validate bid is higher than current highest bid
        if (highestBid && highestBid.amount > 0) {
          const currentBidWei = parseEther(bidAmount);
          if (currentBidWei <= highestBid.amount) {
            const highestBidETH = parseFloat(
              formatEther(highestBid.amount.toString())
            ).toFixed(6);
            setError(
              `Bid amount must be higher than current highest bid of ${highestBidETH} ETH`
            );
            setIsSubmitting(false);
            return;
          }
        }

        await placeBidEnglish(listingId, bidAmount);
      } else if (isDutch) {
        // For Dutch auction, we need current price
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError("Please enter current price amount");
          setIsSubmitting(false);
          return;
        }
        await purchaseDutchAuction(listingId, bidAmount);
      } else if (isSealed) {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          setError("Please enter a valid bid amount");
          setIsSubmitting(false);
          return;
        }
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
          setError("Please enter a valid deposit amount");
          setIsSubmitting(false);
          return;
        }

        const minimumDepositETH = 0.0001;
        const bidAmountFloat = parseFloat(bidAmount);
        const depositAmountFloat = parseFloat(depositAmount);

        console.log("🔍 Sealed bid validation:", {
          bidAmount,
          depositAmount,
          bidAmountFloat,
          depositAmountFloat,
          minimumDepositETH,
          reservePrice: listing.reservePrice,
        });

        if (depositAmountFloat < minimumDepositETH) {
          setError(
            `Deposit amount must be at least ${minimumDepositETH} ETH to cover gas fees and contract requirements`
          );
          setIsSubmitting(false);
          return;
        }

        // Ensure deposit is reasonable compared to bid amount
        if (depositAmountFloat > bidAmountFloat) {
          setError("Deposit amount cannot be higher than your bid amount");
          setIsSubmitting(false);
          return;
        }

        // Use fallback minimum deposit
        const minDeposit = 0.001; // 0.001 ETH minimum
        const tokenSymbol = paymentTokenInfo?.symbol || "ETH";

        if (depositAmountFloat < minDeposit) {
          setError(
            `Deposit amount must be at least ${minDeposit} ${tokenSymbol}`
          );
          setIsSubmitting(false);
          return;
        }

        // Additional validation: ensure bid is meaningful
        if (bidAmountFloat <= minDeposit) {
          setError(
            `Hidden bid amount should be higher than ${minDeposit} ${tokenSymbol}`
          );
          setIsSubmitting(false);
          return;
        }

        console.log("✅ Sealed bid validation passed, calling commitBid...");

        // Enhanced debug logging before transaction
        console.log("🚀 SEALED BID COMMIT - Transaction Debug Info:", {
          listingId: listingId.toString(),
          bidAmount: bidAmount + " ETH",
          depositAmount: depositAmount + " ETH",
          contractAddresses: {
            auctionHouse: CONTRACTS.DomainAuctionHouse,
            sealedBidStrategy: CONTRACTS.SealedBidAuction,
          },
          validationChecks: {
            bidAboveDeposit: parseFloat(bidAmount) > parseFloat(depositAmount),
          },
        });

        console.log("🎯 All checks passed, executing commitBid...");
        await commitBid(listingId, bidAmount, depositAmount);
      }

      // Don't reset isSubmitting here, let it be handled by loading states
    } catch (error: any) {
      console.error("❌ Transaction error:", error);

      let formattedError = formatTransactionError(error);

      // Enhanced error handling for sealed bid auctions
      if (isSealed) {
        const errorMessage = error?.message || error?.reason || "";
        console.log("🔍 Analyzing sealed bid error:", {
          fullError: error,
          message: errorMessage,
          cause: error?.cause,
          name: error?.name,
        });

        if (errorMessage.includes("CommitmentNotFound")) {
          formattedError =
            "No commitment found. Please ensure you are in the commit phase and using the correct data format.";
        } else if (errorMessage.includes("AuctionNotInCommitPhase")) {
          formattedError =
            "Auction is not in commit phase. Wait for commit phase to start.";
        } else if (errorMessage.includes("InsufficientDeposit")) {
          formattedError =
            "Deposit amount is too low. Please increase your deposit amount.";
        } else if (errorMessage.includes("AlreadyCommitted")) {
          formattedError =
            "You have already placed a commitment for this auction.";
        } else if (errorMessage.includes("InvalidCommitment")) {
          formattedError = "Invalid commitment hash. Please try again.";
        } else if (errorMessage.includes("InvalidBid")) {
          formattedError =
            "Invalid bid: The transaction value doesn't match the deposit amount. This usually means the ETH value wasn't sent correctly.";
        } else if (errorMessage.includes("simulation failed")) {
          formattedError =
            "Transaction simulation failed: " +
            errorMessage +
            ". Check console for details.";
        } else if (errorMessage.includes("User rejected") || 
                   errorMessage.includes("user rejected") || 
                   errorMessage.includes("rejected the request") ||
                   errorMessage.includes("User denied")) {
          formattedError = "Transaction was rejected in wallet.";
        }
      }

      // General error handling for all auction types
      const errorMessage = error?.message || error?.reason || "";
      if (errorMessage.includes("User rejected") || 
          errorMessage.includes("user rejected") || 
          errorMessage.includes("rejected the request") ||
          errorMessage.includes("User denied")) {
        formattedError = "Transaction was rejected in wallet.";
        console.log("🚫 Transaction rejected by user");
      }

      setError(formattedError);
      setIsSubmitting(false);
    }
  };

  const formatPrice = (priceWei: string) => {
    try {
      const ethValue = parseFloat(formatEther(priceWei));

      // Handle very small values - show up to 6 decimal places
      if (ethValue < 0.000001) {
        return `${ethValue.toFixed(8)} ETH`;
      } else if (ethValue < 0.001) {
        return `${ethValue.toFixed(6)} ETH`;
      } else if (ethValue < 1) {
        return `${ethValue.toFixed(4)} ETH`;
      } else {
        return `${ethValue.toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })} ETH`;
      }
    } catch {
      return `${priceWei} wei`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDutch ? "Purchase" : "Place Bid"}
            <Badge
              variant={isStrategySet ? "default" : "outline"}
              className={
                isStrategySet
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500"
              }
            >
              {strategyName}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Listing Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {listing.metadata?.name ||
                  `Token #${listing.tokenId.slice(-8)}`}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {listing.metadata?.tld || ".eth"}
                </span>
              </span>
            </div>
            {/* Reserve Price - hidden for Dutch auctions */}
            {!isDutch && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reserve Price:</span>
                <div className="flex items-center gap-1 font-medium">
                  <span>
                    {formatPrice(listing.reservePrice).replace(" ETH", "")}
                  </span>
                  <Image
                    src="/images/LogoCoin/eth-logo.svg"
                    alt="ETH"
                    className="h-4 w-4"
                    width={16}
                    height={16}
                  />
                  <span>ETH</span>
                </div>
              </div>
            )}

            {/* Current Price for Dutch auctions only */}
            {isDutch && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Price (ETH):</span>
                <div className="flex items-center gap-1 font-medium">
                  {currentPriceError ? (
                    <span className="text-red-500 text-xs">
                      {currentPriceError}
                    </span>
                  ) : currentPrice ? (
                    <>
                      <span>
                        {formatPrice(currentPrice.toString()).replace(
                          " ETH",
                          ""
                        )}
                      </span>
                      <Image
                        src="/images/LogoCoin/eth-logo.svg"
                        alt="ETH"
                        className="h-4 w-4"
                        width={16}
                        height={16}
                      />
                      <span>ETH</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">Loading...</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {!isStrategySet ? (
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm">
                Strategy not set yet. This listing is not ready for bidding.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* English Auction */}
              {isEnglish && (
                <div className="space-y-4">
                  {/* Show current highest bid */}
                  {highestBid && highestBid.amount > 0 && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex-shrink-0">🏆</div>
                      <div className="flex-1">
                        <div className="font-medium">Current Highest Bid</div>
                        <div className="flex items-center gap-1 text-xs mt-1 text-blue-600 dark:text-blue-400">
                          <span>
                            {parseFloat(
                              formatEther(highestBid.amount.toString())
                            ).toFixed(6)}
                          </span>
                          <Image
                            src="/images/LogoCoin/eth-logo.svg"
                            alt="ETH"
                            className="h-3 w-3"
                            width={12}
                            height={12}
                          />
                          <span>
                            ETH by {highestBid.bidder.slice(0, 6)}...
                            {highestBid.bidder.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No bids yet */}
                  {highestBid && highestBid.amount === BigInt(0) && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 dark:bg-gray-900/20 p-3 rounded border border-gray-200 dark:border-gray-800">
                      <div className="flex-shrink-0">💰</div>
                      <div className="flex-1">
                        <div className="font-medium">No Bids Yet</div>
                        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                          Be the first to place a bid on this auction!
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="bidAmount"
                      className="flex items-center gap-2"
                    >
                      Your Bid Amount ({paymentTokenInfo?.symbol || "ETH"})
                      <Image
                        src="/images/logoCoin/eth-logo.svg"
                        alt="eth"
                        className="h-4 w-4"
                        width={18}
                        height={18}
                      />
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.00001"
                      min={
                        highestBid && highestBid.amount > 0
                          ? formatEther(
                              (highestBid.amount + BigInt(1)).toString()
                            )
                          : "0.00001"
                      }
                      placeholder="Enter your bid amount"
                      value={bidAmount}
                      onChange={(e) => {
                        const newBidAmount = e.target.value;
                        setBidAmount(newBidAmount);
                        
                        // Clear previous validation errors
                        setBidValidationError("");
                        
                        // Validate bid amount for English auctions
                        if (isEnglish && newBidAmount && highestBid) {
                          const bidAmountFloat = parseFloat(newBidAmount);
                          const highestBidFloat = parseFloat(formatEther(highestBid.amount.toString()));
                          const reservePriceFloat = parseFloat(formatEther(listing.reservePrice));
                          
                          if (highestBid.amount > 0) {
                            // There's already a highest bid
                            if (bidAmountFloat <= highestBidFloat) {
                              setBidValidationError(`Your bid must be higher than the current highest bid of ${highestBidFloat.toFixed(6)} ETH`);
                            }
                          } else {
                            // No bids yet, check against reserve price
                            if (bidAmountFloat < reservePriceFloat) {
                              setBidValidationError(`Your bid must be at least the reserve price of ${reservePriceFloat.toFixed(6)} ETH`);
                            }
                          }
                        }
                        
                        // Clear success dialog when user starts typing new amount
                        if (showSuccessDialog) {
                          console.log(
                            "🔄 User typing new bid - clearing success dialog"
                          );
                          setShowSuccessDialog(false);
                        }
                      }}
                      disabled={isLoading}
                    />
                    {/* Bid validation alert for English auctions */}
                    {bidValidationError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex-shrink-0">⚠️</div>
                        <div className="flex-1">
                          <div className="font-medium">Invalid Bid Amount</div>
                          <div className="text-xs mt-1 text-red-600 dark:text-red-400">
                            {bidValidationError}
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {highestBid && highestBid.amount > 0
                        ? `Enter your bid amount. Must be higher than ${parseFloat(
                            formatEther(highestBid.amount.toString())
                          ).toFixed(6)} ETH.`
                        : "Enter your bid amount. Must be higher than reserve price."}
                    </p>
                  </div>
                </div>
              )}

              {/* Dutch Auction */}
              {isDutch && (
                <div className="space-y-2">
                  <Label
                    htmlFor="bidAmount"
                    className="flex items-center gap-2"
                  >
                    Your Purchase Amount ({paymentTokenInfo?.symbol || "ETH"})
                    <Image
                      src="/images/logoCoin/eth-logo.svg"
                      alt="eth"
                      className="h-4 w-4"
                      width={18}
                      height={18}
                    />
                  </Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    step="0.00001"
                    min="0.00001"
                    placeholder="Enter your bid offer"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(e.target.value);
                      // Clear success dialog when user starts typing new amount
                      if (showSuccessDialog) {
                        console.log(
                          "🔄 User typing new bid - clearing success dialog"
                        );
                        setShowSuccessDialog(false);
                      }
                    }}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Enter your purchase amount. Dutch auctions have declining
                    prices - first to pay wins!
                  </p>
                </div>
              )}

              {/* Sealed Bid Auction */}
              {isSealed && (
                <div className="space-y-4">
                  {/* Show phase status */}
                  {sealedBidPhase && (
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50 dark:bg-gray-900">
                      <div className="flex-shrink-0">
                        {sealedBidPhase.phase === 1 && "🔒"}
                        {sealedBidPhase.phase === 2 && "👁️"}
                        {sealedBidPhase.phase === 3 && "✅"}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {sealedBidPhase.phase === 1 && "Commit Phase"}
                          {sealedBidPhase.phase === 2 && "Reveal Phase"}
                          {sealedBidPhase.phase === 3 && "Auction Ended"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {sealedBidPhase.phase === 1 &&
                            "Place your sealed bids now"}
                          {sealedBidPhase.phase === 2 &&
                            "Bidders must reveal their bids"}
                          {sealedBidPhase.phase === 3 &&
                            "Auction has concluded"}
                        </div>
                      </div>
                      <Badge
                        variant={
                          sealedBidPhase.phase === 1
                            ? "default"
                            : sealedBidPhase.phase === 2
                            ? "secondary"
                            : "outline"
                        }
                      >
                        Phase {sealedBidPhase.phase}
                      </Badge>
                    </div>
                  )}

                  {/* Show reveal phase message */}
                  {sealedBidPhase && sealedBidPhase.phase === 2 && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex-shrink-0">ℹ️</div>
                      <div className="flex-1">
                        <div className="font-medium">
                          Auction is in Reveal Phase
                        </div>
                        <div className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                          Bidding is closed. Bidders must now reveal their
                          sealed bids to determine the winner.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show ended phase message */}
                  {sealedBidPhase && sealedBidPhase.phase === 3 && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 dark:bg-gray-900/20 p-3 rounded border border-gray-200 dark:border-gray-800">
                      <div className="flex-shrink-0">🏁</div>
                      <div className="flex-1">
                        <div className="font-medium">Auction Has Ended</div>
                        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                          This auction has concluded. No more bids can be
                          placed.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show less intrusive error message */}
                  {minDepositError && !sealedBidParams && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                      <div className="flex-shrink-0">⚠️</div>
                      <div className="flex-1">
                        <div className="font-medium">
                          Unable to fetch contract parameters
                        </div>
                        <div className="text-xs mt-1 text-amber-600 dark:text-amber-400">
                          {minDepositError}. Using fallback values - please
                          verify on chain.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="bidAmount"
                      className="flex items-center gap-2"
                    >
                      Hidden Bid Amount ({paymentTokenInfo?.symbol || "ETH"})
                      <Image
                        src="/images/logo/domaLogo.svg"
                        alt="Doma"
                        className="h-4 w-4"
                        width={18}
                        height={18}
                      />
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.00001"
                      min={
                        sealedBidParams
                          ? formatEther(sealedBidParams.minDeposit.toString())
                          : "0.00001"
                      }
                      placeholder="0.001"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value);
                        // Clear success dialog when user starts typing new amount
                        if (showSuccessDialog) {
                          console.log(
                            "🔄 User typing new bid - clearing success dialog"
                          );
                          setShowSuccessDialog(false);
                        }
                      }}
                      disabled={isLoading || sealedBidPhase?.phase !== 1}
                    />
                    <p className="text-xs text-gray-500">
                      Your actual bid amount (kept secret until reveal phase).
                      {sealedBidPhase?.phase !== 1 &&
                        " Bidding is only allowed during commit phase."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="depositAmount"
                      className="flex items-center gap-2"
                    >
                      Deposit Amount ({paymentTokenInfo?.symbol || "ETH"})
                      <Image
                        src="/images/logo/domaLogo.svg"
                        alt="Doma"
                        className="h-4 w-4"
                        width={18}
                        height={18}
                      />
                    </Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      step="0.00001"
                      min={
                        sealedBidParams
                          ? formatEther(sealedBidParams.minDeposit.toString())
                          : "0.0001"
                      }
                      placeholder={
                        sealedBidParams
                          ? formatEther(sealedBidParams.minDeposit.toString())
                          : "0.0001"
                      }
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={isLoading || sealedBidPhase?.phase !== 1}
                    />
                    <p className="text-xs text-gray-500">
                      Minimum deposit:{" "}
                      {sealedBidParams
                        ? formatEther(sealedBidParams.minDeposit.toString())
                        : minDepositError
                        ? "0.0001 (fallback)"
                        : "Loading..."}{" "}
                      {paymentTokenInfo?.symbol || "ETH"}. Refunded if you
                      don&apos;t win.
                      {sealedBidPhase?.phase !== 1 &&
                        " Deposits are only accepted during commit phase."}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={isSubmitting || isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isLoading ||
                    !bidAmount ||
                    bidValidationError !== "" || // Disable if there's a validation error
                    (isSealed &&
                      (!depositAmount ||
                        sealedBidPhase?.phase !== 1 ||
                        // Only enforce contract minDeposit if we have the parameters
                        (sealedBidParams &&
                          parseFloat(depositAmount || "0") <
                            parseFloat(
                              formatEther(sealedBidParams.minDeposit.toString())
                            )) ||
                        // If we don't have params but have an error, enforce fallback minimum
                        (!sealedBidParams &&
                          !!minDepositError &&
                          parseFloat(depositAmount || "0") < 0.0001)))
                  }
                  className="flex-1 relative"
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      {isSubmitting && !isLoading
                        ? "Confirming..."
                        : "Processing..."}
                    </div>
                  ) : isDutch ? (
                    "Purchase Now"
                  ) : isSealed ? (
                    sealedBidPhase?.phase === 2 ? (
                      "Auction in Reveal Phase"
                    ) : sealedBidPhase?.phase === 3 ? (
                      "Auction Ended"
                    ) : sealedBidPhase?.phase === 1 ? (
                      "Commit Bid"
                    ) : (
                      "Commit Bid"
                    )
                  ) : (
                    "Place Bid"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>

      <BidSuccessDialog
        key={currentBidKey || "default"} // Force remount with new key
        isOpen={showSuccessDialog}
        onClose={() => {
          console.log("🚪 Closing BidSuccessDialog - complete state reset");
          setShowSuccessDialog(false);
          setSuccessBidAmount("");
          setSuccessBidType("bid");

          // Clear current bid key to prevent re-showing
          setCurrentBidKey(null);

          // Clean manual states to prevent reappearance
          setManualTransactionStates({});

          // Force component reset to clear all wagmi states
          onClose(true); // Pass true to trigger force reset
        }}
        listing={listing}
        transactionHash={
          currentBidKey
            ? manualTransactionStates[currentBidKey]?.hash || successHash
            : successHash
        }
        bidAmount={successBidAmount || bidAmount || depositAmount}
        bidType={successBidType}
      />
    </Dialog>
  );
}

// Main interface without forceReset parameter for external usage
interface MainBidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: (Listing & { metadata?: NFTMetadata }) | null;
}

// Wrapper component with key-based reset mechanism
export default function BidDialog({
  isOpen,
  onClose,
  listing,
}: MainBidDialogProps) {
  const [componentKey, setComponentKey] = useState(0);

  // Force remount component when success dialog is closed to reset all wagmi states
  const handleForceReset = () => {
    console.log("🔄 Force resetting BidDialog component");
    setComponentKey((prev) => prev + 1);
  };

  return (
    <BidDialogInner
      key={componentKey}
      isOpen={isOpen}
      onClose={(forceReset?: boolean) => {
        if (forceReset) {
          handleForceReset();
        }
        onClose();
      }}
      listing={listing}
    />
  );
}
