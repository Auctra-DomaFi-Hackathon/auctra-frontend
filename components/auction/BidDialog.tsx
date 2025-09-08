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
  useGetHighestBid,
  getSealedBidParams,
  type SealedBidParams,
} from "@/hooks/useAuction";
import {
  useEnhancedPlaceBid,
  useEnhancedRevealBid,
  useGetCurrentPhase,
} from "@/hooks/useSealedBidAuction";
import { CONTRACTS } from "@/hooks/contracts/constants";
import { getStrategyName } from "@/lib/utils/strategy";
import { formatTransactionError } from "@/lib/utils/auction";
import BidSuccessDialog from "./BidSuccessDialog";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";
import { DOMAIN_AUCTION_HOUSE_ABI } from "@/hooks";
import { useAtom } from "jotai";
import { bidSubmissionLoadingAtom } from "@/atoms/loading";

interface BidDialogProps {
  isOpen: boolean;
  onClose: (forceReset?: boolean) => void;
  listing: (Listing & { metadata?: NFTMetadata }) | null;
}

/** Enhanced panel for better light/dark mode UX */
const Panel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <div
    className={[
      "rounded-3xl overflow-hidden",
      "bg-white/95 shadow-2xl border border-slate-200/80 backdrop-blur-xl",
      "dark:bg-[#0b1220]/95 dark:border-white/10 dark:shadow-black/60",
      className || "",
    ].join(" ")}
  >
    {children}
  </div>
);

function BidDialogInner({ isOpen, onClose, listing }: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState(""); // For sealed bid
  const [error, setError] = useState("");
  const [bidValidationError, setBidValidationError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successBidAmount, setSuccessBidAmount] = useState("");
  const [successBidType, setSuccessBidType] = useState<
    "bid" | "purchase" | "commit"
  >("bid");
  const [isSubmitting, setIsSubmitting] = useAtom(bidSubmissionLoadingAtom);

  // Manual tx tracking
  const [manualTransactionStates, setManualTransactionStates] = useState<{
    [key: string]: {
      isSuccess: boolean;
      hash: string;
      bidAmount: string;
      bidType: string;
      timestamp: number;
    };
  }>({});
  const [currentBidKey, setCurrentBidKey] = useState<string | null>(null);

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
    isPending: sealedPending,
    isSuccess: sealedSuccess,
    hash: sealedHash,
  } = useCommitSealedBid();
  const {
    placeBid: placeBidSealedAuction,
    isPending: placeSealedPending,
    isSuccess: placeSealedSuccess,
    hash: placeSealedHash,
  } = useEnhancedPlaceBid();
  const {
    revealBid: revealBidSealedAuction,
    cleanupStoredData,
    isPending: revealSealedPending,
    isSuccess: revealSealedSuccess,
    hash: revealSealedHash,
  } = useEnhancedRevealBid();
  const { getCurrentPhase } = useGetCurrentPhase();
  const { getHighestBid } = useGetHighestBid();
  const publicClient = usePublicClient();

  const [sealedBidPhase, setSealedBidPhase] = useState<{
    phase: number;
    phaseDescription: string;
    timeRemaining: number;
    error?: string;
  } | null>(null);
  const [sealedBidParams, setSealedBidParams] =
    useState<SealedBidParams | null>(null);
  const [minDepositError, setMinDepositError] = useState<string | null>(null);

  const [paymentTokenInfo, setPaymentTokenInfo] = useState<{
    paymentToken: `0x${string}`;
    isETH: boolean;
    symbol: string;
  } | null>(null);

  const [highestBid, setHighestBid] = useState<{
    bidder: `0x${string}`;
    amount: bigint;
  } | null>(null);

  const [currentPrice, setCurrentPrice] = useState<bigint | null>(null);
  const [currentPriceError, setCurrentPriceError] = useState<string | null>(
    null
  );

  const [auctionStatus, setAuctionStatus] = useState<number | null>(null);

  const isLoading =
    englishPending ||
    dutchPending ||
    sealedPending ||
    placeSealedPending ||
    revealSealedPending;
  const isSuccessful =
    englishSuccess ||
    dutchSuccess ||
    sealedSuccess ||
    placeSealedSuccess ||
    revealSealedSuccess;
  const successHash = englishSuccess
    ? englishHash
    : dutchSuccess
    ? dutchHash
    : sealedSuccess
    ? sealedHash
    : placeSealedSuccess
    ? placeSealedHash
    : revealSealedSuccess
    ? revealSealedHash
    : undefined;

  const strategyName = listing ? getStrategyName(listing.strategy) : "";
  const isEnglish = strategyName === "English Auction";
  const isDutch = strategyName === "Dutch Auction";
  const isSealed = strategyName === "Sealed Bid Auction";
  const isStrategySet =
    listing?.strategy &&
    listing.strategy !== "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    if (isSuccessful && !isLoading && successHash && currentBidKey) {
      const existing = manualTransactionStates[currentBidKey];
      if (!existing || !existing.isSuccess) {
        const isRevealTx = currentBidKey.startsWith("reveal_");
        const state = {
          isSuccess: true,
          hash: successHash,
          bidAmount: bidAmount || depositAmount,
          bidType: isDutch
            ? "purchase"
            : isSealed
            ? isRevealTx
              ? "reveal"
              : "commit"
            : "bid",
          timestamp: Date.now(),
        };
        setManualTransactionStates((p) => ({ ...p, [currentBidKey]: state }));
        setShowSuccessDialog(false);

        // Clean up localStorage on reveal success
        if (isRevealTx && listing && revealSealedSuccess) {
          cleanupStoredData(BigInt(listing.id));
        }

        setTimeout(() => {
          setShowSuccessDialog(true);
          setSuccessBidAmount(state.bidAmount);
          setSuccessBidType(state.bidType as "bid" | "purchase" | "commit");
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
    listing,
    revealSealedSuccess,
    cleanupStoredData,
  ]);

  useEffect(() => {
    if (!currentBidKey) return;
    const s = manualTransactionStates[currentBidKey];
    if (s && s.isSuccess && !showSuccessDialog) {
      setShowSuccessDialog(true);
      setSuccessBidAmount(s.bidAmount);
      setSuccessBidType(s.bidType as "bid" | "purchase" | "commit");
    }
  }, [currentBidKey, manualTransactionStates, showSuccessDialog]);

  const resetDialogState = () => {
    setBidAmount("");
    setDepositAmount("");
    setError("");
    setBidValidationError("");
    setShowSuccessDialog(false);
    setSuccessBidAmount("");
    setIsSubmitting(false);
    setCurrentBidKey(null);
    const now = Date.now();
    setManualTransactionStates((prev) => {
      const f: typeof prev = {};
      Object.entries(prev).forEach(([k, v]) => {
        if (now - v.timestamp < 5 * 60 * 1000) f[k] = v;
      });
      return f;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setShowSuccessDialog(false);
      setSuccessBidAmount("");
      setSuccessBidType("bid");
      setError("");
      setCurrentBidKey(null);
    } else {
      resetDialogState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isLoading && (isSuccessful || error)) setIsSubmitting(false);
  }, [isLoading, isSuccessful, error]);

  useEffect(() => {
    if (isSubmitting) {
      const t = setTimeout(() => {
        if (
          !englishPending &&
          !dutchPending &&
          !sealedPending &&
          !placeSealedPending &&
          !revealSealedPending
        ) {
          setIsSubmitting(false);
        }
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [
    isSubmitting,
    englishPending,
    dutchPending,
    sealedPending,
    placeSealedPending,
    revealSealedPending,
  ]);

  useEffect(() => {
    const i = setInterval(() => {
      const now = Date.now();
      setManualTransactionStates((prev) => {
        const f: typeof prev = {};
        Object.entries(prev).forEach(([k, v]) => {
          if (now - v.timestamp < 10 * 60 * 1000) f[k] = v;
        });
        return Object.keys(f).length !== Object.keys(prev).length ? f : prev;
      });
    }, 60000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fetchContractData = async () => {
      if (listing && isOpen && publicClient) {
        try {
          const listingData = await publicClient.readContract({
            address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
            abi: DOMAIN_AUCTION_HOUSE_ABI,
            functionName: "listings",
            args: [BigInt(listing.id)],
          });

          const arr = [...(listingData as readonly any[])];
          const paymentToken = arr[3] as `0x${string}`;
          const isETHPay = isAddressEqual(paymentToken, zeroAddress);
          const status = Number(arr[10]);

          setPaymentTokenInfo({
            paymentToken,
            isETH: isETHPay,
            symbol: isETHPay ? "ETH" : "ERC20",
          });
          setAuctionStatus(status);

          if (isEnglish || isDutch) {
            try {
              const hb = await getHighestBid(BigInt(listing.id));
              setHighestBid(hb);
            } catch {
              setHighestBid({
                bidder:
                  "0x0000000000000000000000000000000000000000" as `0x${string}`,
                amount: BigInt(0),
              });
            }
          }

          if (isDutch) {
            try {
              const p = (await publicClient.readContract({
                address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
                abi: DOMAIN_AUCTION_HOUSE_ABI,
                functionName: "previewCurrentPrice",
                args: [BigInt(listing.id)],
              })) as bigint;
              setCurrentPrice(p);
              setCurrentPriceError(null);
            } catch (e: any) {
              setCurrentPrice(null);
              setCurrentPriceError(
                e instanceof Error ? e.message : "Failed to fetch current price"
              );
            }
          }

          if (isSealed) {
            try {
              const phase = await getCurrentPhase(BigInt(listing.id));
              setSealedBidPhase(phase);
              const params = await getSealedBidParams(
                publicClient,
                CONTRACTS.DomainAuctionHouse as `0x${string}`,
                BigInt(listing.id)
              );
              setSealedBidParams(params);
              setMinDepositError(null);
            } catch (e: any) {
              setSealedBidPhase({
                phase: -1,
                phaseDescription: "ERROR",
                timeRemaining: 0,
                error: e?.message ?? "Unknown error",
              });
              setMinDepositError("Failed to fetch sealed bid parameters");
            }
          }
        } catch (e: any) {
          if (isSealed) {
            setSealedBidPhase({
              phase: -1,
              phaseDescription: "ERROR",
              timeRemaining: 0,
              error: e?.message ?? "Unknown error",
            });
            setMinDepositError("Failed to fetch contract parameters");
          }
        }
      } else {
        setPaymentTokenInfo(null);
        setSealedBidPhase(null);
        setSealedBidParams(null);
        setMinDepositError(null);
        setHighestBid(null);
        setCurrentPrice(null);
        setCurrentPriceError(null);
        setAuctionStatus(null);
      }
    };

    const t = setTimeout(fetchContractData, 400);
    return () => clearTimeout(t);
  }, [
    listing,
    isOpen,
    isSealed,
    isEnglish,
    isDutch,
    getCurrentPhase,
    getHighestBid,
    publicClient,
  ]);

  if (!listing) return null;

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const bidKey = `reveal_${listing.id}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    setCurrentBidKey(bidKey);
    setShowSuccessDialog(false);
    setSuccessBidAmount("");
    setSuccessBidType("commit");

    try {
      const listingId = BigInt(listing.id);

      // Check if we have stored commitment data
      const storedNonce = localStorage.getItem(`nonce_${listingId}`);
      const storedBidAmount = localStorage.getItem(`bidAmount_${listingId}`);

      if (!storedNonce || !storedBidAmount) {
        setError(
          "No sealed bid data found. You must commit a bid first before revealing."
        );
        setIsSubmitting(false);
        return;
      }

      await revealBidSealedAuction(listingId);
    } catch (err: any) {
      let msg = formatTransactionError(err);
      const e = err?.message || err?.reason || "";
      if (
        e.includes("User rejected") ||
        e.includes("user rejected") ||
        e.includes("rejected the request") ||
        e.includes("User denied")
      ) {
        msg = "Transaction was rejected in wallet.";
      }
      setError(msg);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const bidKey = `bid_${listing.id}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    setCurrentBidKey(bidKey);
    setShowSuccessDialog(false);
    setSuccessBidAmount("");
    setSuccessBidType("bid");
    setManualTransactionStates((prev) => {
      const f: typeof prev = {};
      Object.entries(prev).forEach(([k, v]) => {
        if (Date.now() - v.timestamp < 2 * 60 * 1000) f[k] = v;
      });
      return f;
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
        if (highestBid && highestBid.amount > 0) {
          const wei = parseEther(bidAmount);
          if (wei <= highestBid.amount) {
            const h = parseFloat(
              formatEther(highestBid.amount.toString())
            ).toFixed(6);
            setError(
              `Bid amount must be higher than current highest bid of ${h} ETH`
            );
            setIsSubmitting(false);
            return;
          }
        }
        await placeBidEnglish(listingId, bidAmount);
      } else if (isDutch) {
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

        // Use dynamic minimum deposit from contract parameters if available
        const dynamicMinDeposit = sealedBidParams
          ? parseFloat(formatEther(sealedBidParams.minDeposit.toString()))
          : 0.0001; // Fallback to a smaller amount like in the test (0.0001 ETH)

        const dep = parseFloat(depositAmount);

        if (dep < dynamicMinDeposit) {
          setError(
            `Deposit amount must be at least ${dynamicMinDeposit} ${
              paymentTokenInfo?.symbol ?? "ETH"
            }`
          );
          setIsSubmitting(false);
          return;
        }
        // Remove rule "deposit <= bid" as instructed - it can conflict with minDeposit

        // 🚨 DEBUG: Log exact values before sending to hook
        console.log("🔍 BidDialog - Values before calling hook:", {
          bidAmount_value: bidAmount,
          bidAmount_type: typeof bidAmount,
          depositAmount_value: depositAmount,
          depositAmount_type: typeof depositAmount,
          bidAmount_parsed: parseFloat(bidAmount),
          depositAmount_parsed: parseFloat(depositAmount),
        });

        // Use enhanced approach with eligibility support as specified in CLAUDE.md
        // For sealed bid auctions, use empty eligibilityProof as per instructions
        await placeBidSealedAuction(listingId, bidAmount, depositAmount, "0x");
      }
    } catch (err: any) {
      let msg = formatTransactionError(err);
      const e = err?.message || err?.reason || "";
      if (
        e.includes("User rejected") ||
        e.includes("user rejected") ||
        e.includes("rejected the request") ||
        e.includes("User denied")
      ) {
        msg = "Transaction was rejected in wallet.";
      }
      setError(msg);
      setIsSubmitting(false);
    }
  };

  const formatPrice = (w: string) => {
    try {
      const n = parseFloat(formatEther(w));
      if (n < 0.000001) return `${n.toFixed(8)} ETH`;
      if (n < 0.001) return `${n.toFixed(6)} ETH`;
      if (n < 1) return `${n.toFixed(4)} ETH`;
      return `${n.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
    } catch {
      return `${w} wei`;
    }
  };

  return (
    <Dialog open={isOpen && !showSuccessDialog} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] border-0 bg-transparent p-0">
        <Panel>
          <div className="p-5">
            <DialogHeader className="pb-3">
              <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                {isDutch ? "Purchase" : isSealed ? "Sealed Bid" : "Place Bid"}
                <Badge
                  className={
                    isStrategySet
                      ? "text-blue-700 bg-sky-500/15 dark:text-sky-300 ring-1 ring-sky-500/40 rounded-full px-3 py-1 text-[12px] dark:bg-sky-500/15"
                      : "text-slate-500 ring-1 ring-white/10 rounded-full px-3 py-1 text-[12px]"
                  }
                  variant="secondary"
                >
                  {strategyName}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Listing Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-900 dark:text-slate-100">
                  <span className="font-medium">
                    {listing.metadata?.name ||
                      `Token #${listing.tokenId.slice(-8)}`}
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      {listing.metadata?.tld || ".eth"}
                    </span>
                  </span>
                </div>

                {!isDutch && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Reserve Price:
                    </span>
                    <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-slate-100">
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

                {isDutch && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Current Price (ETH):
                    </span>
                    <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-slate-100">
                      {currentPriceError ? (
                        <span className="text-red-400 text-xs">
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
                        <span className="text-slate-500 text-xs">
                          Loading...
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-200/70 dark:bg-white/10" />

              {!isStrategySet ? (
                <div className="text-center py-4 text-slate-600 dark:text-slate-400 text-sm">
                  Strategy not set yet. This listing is not ready for bidding.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* English Auction - Check ended status using contract listings data */}
                  {isEnglish && (
                    <div className="space-y-4">
                      {auctionStatus === 3 && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/40">
                          <div className="flex-shrink-0">🔴</div>
                          <div className="flex-1">
                            <div className="font-medium">
                              This auction has ended
                            </div>
                            <div className="text-xs mt-1">
                              This English auction has ended. Bidding is no
                              longer available.
                            </div>
                          </div>
                        </div>
                      )}

                      {highestBid && highestBid.amount > 0 && (
                        <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
                          <div className="flex-shrink-0 text-lg">🏆</div>
                          <div className="flex-1">
                            <div className="text-gray-800 font-semibold">
                              Current Highest Bid
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <span className="font-mono text-gray-900">
                                {parseFloat(
                                  formatEther(highestBid.amount.toString())
                                ).toFixed(6)}
                              </span>
                              <Image
                                src="/images/LogoCoin/eth-logo.svg"
                                alt="ETH"
                                className="h-4 w-4"
                                width={16}
                                height={16}
                              />
                              <span className="truncate max-w-[140px]">
                                by {highestBid.bidder.slice(0, 6)}...
                                {highestBid.bidder.slice(-4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {highestBid && highestBid.amount === BigInt(0) && (
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="flex-shrink-0 text-lg">💰</div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-700">
                              No Bids Yet
                            </div>
                            <div className="text-xs mt-1 text-gray-500">
                              Be the first to place a bid on this auction!
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label
                          htmlFor="bidAmount"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
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
                            const v = e.target.value;
                            setBidAmount(v);
                            setBidValidationError("");
                            if (isEnglish && v && highestBid) {
                              const b = parseFloat(v);
                              const h = parseFloat(
                                formatEther(highestBid.amount.toString())
                              );
                              const r = parseFloat(
                                formatEther(listing.reservePrice)
                              );
                              if (highestBid.amount > 0) {
                                if (b <= h)
                                  setBidValidationError(
                                    `Your bid must be higher than the current highest bid of ${h.toFixed(
                                      6
                                    )} ETH`
                                  );
                              } else if (b < r) {
                                setBidValidationError(
                                  `Your bid must be at least the reserve price of ${r.toFixed(
                                    6
                                  )} ETH`
                                );
                              }
                            }
                            if (showSuccessDialog) setShowSuccessDialog(false);
                          }}
                          disabled={isLoading || auctionStatus === 3}
                          className="bg-white/80 border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder-slate-500 dark:border-white/10 dark:focus:ring-sky-400/20 dark:focus:border-sky-400"
                        />
                        {bidValidationError && (
                          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/40">
                            <div className="flex-shrink-0">⚠️</div>
                            <div className="flex-1">
                              <div className="font-medium">
                                Invalid Bid Amount
                              </div>
                              <div className="text-xs mt-1">
                                {bidValidationError}
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {auctionStatus === 3
                            ? "This English auction has ended. Bidding is no longer available."
                            : highestBid && highestBid.amount > 0
                            ? `Enter your bid amount. Must be higher than ${parseFloat(
                                formatEther(highestBid.amount.toString())
                              ).toFixed(6)} ETH.`
                            : "Enter your bid amount. Must be higher than reserve price."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dutch Auction - Check ended status using contract listings data or highest bid */}
                  {isDutch && (
                    <div className="space-y-4">
                      {(auctionStatus === 3 || (highestBid && highestBid.amount > 0)) && (
                        <div className="space-y-3">
                          {/* Winner display if auction ended with a buyer */}
                          {highestBid && (
                            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl dark:from-green-900/30 dark:to-green-800/30 dark:border-green-700">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="text-3xl">🎉</div>
                                <div>
                                  <div className="text-lg font-bold text-green-800 dark:text-green-200">
                                    Auction Won!
                                  </div>
                                  <div className="text-sm text-green-600 dark:text-green-400">
                                    This Dutch auction has been won by the first buyer
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white/80 dark:bg-white/10 rounded-lg p-3 border border-green-200 dark:border-green-600">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
                                      Winner Address
                                    </div>
                                    <div className="font-mono text-sm text-green-900 dark:text-green-100 break-all">
                                      {highestBid.bidder.slice(0, 10)}...{highestBid.bidder.slice(-8)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
                                      Purchase Price
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-green-900 dark:text-green-100">
                                        {parseFloat(formatEther(highestBid.amount.toString())).toFixed(6)}
                                      </span>
                                      <Image
                                        src="/images/LogoCoin/eth-logo.svg"
                                        alt="ETH"
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                      />
                                      <span className="text-sm font-medium text-green-900 dark:text-green-100">ETH</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* General ended message */}
                          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-900/20 p-3 rounded border border-red-900/40">
                            <div className="flex-shrink-0">🔴</div>
                            <div className="flex-1">
                              <div className="font-medium text-red-600">
                                Auction Has Ended
                              </div>
                              <div className="text-xs mt-1 text-red-600">
                                This Dutch auction has ended. Purchasing is no
                                longer available.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label
                          htmlFor="bidAmount"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          Your Purchase Amount (
                          {paymentTokenInfo?.symbol || "ETH"})
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
                            if (showSuccessDialog) setShowSuccessDialog(false);
                          }}
                          disabled={isLoading || auctionStatus === 3 || !!(highestBid && highestBid.amount > 0)}
                          className="bg-white/80 border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder-slate-500 dark:border-white/10 dark:focus:ring-sky-400/20 dark:focus:border-sky-400"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {auctionStatus === 3 || (highestBid && highestBid.amount > 0)
                            ? "This Dutch auction has ended. Purchasing is no longer available."
                            : "Enter your purchase amount. Dutch auctions have declining prices - first to pay wins!"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sealed Bid Auction - Check ended status using getCurrentPhase (phase 3 = ended) */}
                  {isSealed && (
                    <div className="space-y-4">
                      {sealedBidPhase && (
                        <div className="flex items-center gap-2 p-3 rounded-lg ring-1 ring-slate-200 bg-slate-50 dark:ring-white/10 dark:bg-white/[0.04]">
                          <div className="flex-shrink-0">
                            {sealedBidPhase.phase === 1 && "🔒"}
                            {sealedBidPhase.phase === 2 && "👁️"}
                            {sealedBidPhase.phase === 3 && "✅"}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                              {sealedBidPhase.phase === 1 && "Commit Phase"}
                              {sealedBidPhase.phase === 2 && "Reveal Phase"}
                              {sealedBidPhase.phase === 3 && "Auction Ended"}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {sealedBidPhase.phase === 1 &&
                                "Place your sealed bids now"}
                              {sealedBidPhase.phase === 2 &&
                                "Bidders must reveal their bids"}
                              {sealedBidPhase.phase === 3 &&
                                "Auction has concluded"}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/40 dark:text-sky-300"
                          >
                            Phase {sealedBidPhase.phase}
                          </Badge>
                        </div>
                      )}

                      {sealedBidPhase && sealedBidPhase.phase === 2 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sky-600 text-sm bg-sky-500/10 p-3 rounded border border-sky-500/30">
                            <div className="flex-shrink-0">ℹ️</div>
                            <div className="flex-1">
                              <div className="font-medium">
                                Auction is in Reveal Phase
                              </div>
                              <div className="text-xs mt-1 text-sky-600">
                                Bidding is closed. Bidders must now reveal their
                                sealed bids.
                              </div>
                            </div>
                          </div>

                          {/* Reveal Bid Section */}
                          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-shrink-0">👁️</div>
                              <div className="flex-1">
                                <div className="font-medium text-amber-600">
                                  Ready to Reveal Your Bid?
                                </div>
                                <div className="text-xs mt-1 text-amber-800">
                                  Click below to reveal your sealed bid
                                  commitment.
                                </div>
                              </div>
                            </div>

                            <Button
                              type="button"
                              onClick={handleReveal}
                              disabled={isSubmitting || isLoading}
                              className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                            >
                              {isSubmitting || isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                  Revealing...
                                </div>
                              ) : (
                                "Reveal My Bid"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {sealedBidPhase && sealedBidPhase.phase === 3 && (
                        <div className="flex items-center gap-2 text-slate-300 text-sm bg-white/[0.04] p-3 rounded border border-white/10">
                          <div className="flex-shrink-0">🏁</div>
                          <div className="flex-1">
                            <div className="font-medium">Auction Has Ended</div>
                            <div className="text-xs mt-1">
                              This auction has concluded. No more bids can be
                              placed.
                            </div>
                          </div>
                        </div>
                      )}

                      {minDepositError && !sealedBidParams && (
                        <div className="flex items-center gap-2 text-amber-300 text-sm bg-amber-500/10 p-2 rounded border border-amber-500/30">
                          <div className="flex-shrink-0">⚠️</div>
                          <div className="flex-1">
                            <div className="font-medium">
                              Unable to fetch contract parameters
                            </div>
                            <div className="text-xs mt-1">
                              {minDepositError}. Using fallback values - please
                              verify on chain.
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label
                          htmlFor="bidAmount"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          Hidden Bid Amount ({paymentTokenInfo?.symbol || "ETH"}
                          )
                          <Image
                            src="/images/LogoCoin/eth-logo.svg"
                            alt="ETH"
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
                              ? formatEther(
                                  sealedBidParams.minDeposit.toString()
                                )
                              : "0.00001"
                          }
                          placeholder="0.001"
                          value={bidAmount}
                          onChange={(e) => {
                            setBidAmount(e.target.value);
                            if (showSuccessDialog) setShowSuccessDialog(false);
                          }}
                          disabled={isLoading || sealedBidPhase?.phase !== 1}
                          className="bg-white/80 border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder-slate-500 dark:border-white/10 dark:focus:ring-sky-400/20 dark:focus:border-sky-400"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Your actual bid amount (kept secret until reveal
                          phase).
                          {sealedBidPhase?.phase !== 1 &&
                            " Bidding is only allowed during commit phase."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="depositAmount"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          Deposit Amount ({paymentTokenInfo?.symbol || "ETH"})
                          <Image
                            src="/images/LogoCoin/eth-logo.svg"
                            alt="ETH"
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
                              ? formatEther(
                                  sealedBidParams.minDeposit.toString()
                                )
                              : "0.0001"
                          }
                          placeholder={
                            sealedBidParams
                              ? formatEther(
                                  sealedBidParams.minDeposit.toString()
                                )
                              : "0.0001"
                          }
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          disabled={isLoading || sealedBidPhase?.phase !== 1}
                          className="bg-white/80 border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder-slate-500 dark:border-white/10 dark:focus:ring-sky-400/20 dark:focus:border-sky-400"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    <div className="text-red-600 text-sm bg-red-900/20 p-2 rounded ring-1 ring-red-900/40">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onClose()}
                      disabled={isSubmitting || isLoading}
                      className="hover:text-black flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        isLoading ||
                        !bidAmount ||
                        bidValidationError !== "" ||
                        ((isDutch || isEnglish) && auctionStatus === 3) ||
                        (isDutch && highestBid && highestBid.amount > 0) ||
                        (isSealed &&
                          (!depositAmount ||
                            sealedBidPhase?.phase !== 1 ||
                            (sealedBidParams &&
                              parseFloat(depositAmount || "0") <
                                parseFloat(
                                  formatEther(
                                    sealedBidParams.minDeposit.toString()
                                  )
                                )) ||
                            (!sealedBidParams &&
                              !!minDepositError &&
                              parseFloat(depositAmount || "0") < 0.0001)))
                      }
                      className="flex-1 relative bg-sky-600 hover:bg-sky-500 dark:hover:bg-sky-500"
                    >
                      {isSubmitting || isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          {isSubmitting && !isLoading
                            ? "Confirming..."
                            : "Processing..."}
                        </div>
                      ) : isDutch ? (
                        auctionStatus === 3 || (highestBid && highestBid.amount > 0) ? (
                          "Auction Ended"
                        ) : (
                          "Purchase Now"
                        )
                      ) : isSealed ? (
                        sealedBidPhase?.phase === 2 ? (
                          "Auction in Reveal Phase"
                        ) : sealedBidPhase?.phase === 3 ? (
                          "Auction Ended"
                        ) : (
                          "Commit Bid"
                        )
                      ) : isEnglish ? (
                        auctionStatus === 3 ? (
                          "Auction Ended"
                        ) : (
                          "Place Bid"
                        )
                      ) : (
                        "Place Bid"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Panel>
      </DialogContent>

      <BidSuccessDialog
        key={currentBidKey || "default"}
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setSuccessBidAmount("");
          setSuccessBidType("bid");
          setCurrentBidKey(null);
          setManualTransactionStates({});
          onClose(true);
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

export default function BidDialog({
  isOpen,
  onClose,
  listing,
}: MainBidDialogProps) {
  const [componentKey, setComponentKey] = useState(0);
  const handleForceReset = () => setComponentKey((p) => p + 1);

  return (
    <BidDialogInner
      key={componentKey}
      isOpen={isOpen}
      onClose={(forceReset?: boolean) => {
        if (forceReset) handleForceReset();
        onClose();
      }}
      listing={listing}
    />
  );
}
