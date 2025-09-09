"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEther } from "ethers";
import { useAuctionDetails } from "@/lib/graphql/hooks/useAuctionDetails";
import { getStrategyName } from "@/lib/utils/strategy";
import BidDialog from "./BidDialog";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/hooks/contracts/constants";
import { DOMAIN_AUCTION_HOUSE_ABI } from "@/hooks/contracts/abis";
import { useGetSealedBidPhase, getSealedBidParams, type SealedBidParams } from "@/hooks/useAuction";
import { fetchNftImage, type NftImageResult } from "@/lib/utils/nftImage";

interface AuctionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

export default function AuctionDetailsDialog({
  isOpen,
  onClose,
  listingId,
}: AuctionDetailsDialogProps) {
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [auctionTimes, setAuctionTimes] = useState<{
    startTime: number;
    endTime: number;
  } | null>(null);
  const [auctionStatus, setAuctionStatus] = useState<number | null>(null); // 1 = live, 2 = ended
  const [sealedBidPhase, setSealedBidPhase] = useState<{
    phase: number;
    phaseDescription: string;
    timeRemaining: number;
    error?: string;
  } | null>(null);
  const [sealedBidParams, setSealedBidParams] = useState<SealedBidParams | null>(null);
  const [nftImage, setNftImage] = useState<NftImageResult | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const { listing, highestBid, allBids, loading, error } =
    useAuctionDetails(listingId);
  const publicClient = usePublicClient();
  const { getSealedBidPhase } = useGetSealedBidPhase();

  // Fetch auction times and status from contract
  useEffect(() => {
    const fetchAuctionData = async () => {
      if (!publicClient || !listingId || !listing) return;

      try {
        console.log(
          `🔍 Fetching auction data for listing ${listingId} from contract`
        );

        const listingData = (await publicClient.readContract({
          address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
          abi: DOMAIN_AUCTION_HOUSE_ABI,
          functionName: "listings",
          args: [BigInt(listingId)],
        })) as readonly any[];

        const startTime = Number(listingData[5]); // startTime is at index 5
        const endTime = Number(listingData[6]); // endTime is at index 6
        const status = Number(listingData[10]); // status is at index 10 (1 = live, 2 = ended)

        console.log(`⏰ Auction data for ${listingId}:`, {
          startTime: new Date(startTime * 1000).toLocaleString(),
          endTime: new Date(endTime * 1000).toLocaleString(),
          status: status === 1 ? "LIVE" : status === 2 ? "ENDED" : "UNKNOWN",
        });

        setAuctionTimes({ startTime, endTime });
        setAuctionStatus(status);
      } catch (error) {
        console.error(
          `Failed to get auction data for listing ${listingId}:`,
          error
        );
      }
    };

    fetchAuctionData();
  }, [listingId, publicClient, listing]);

  // Separate effect for sealed bid phase information to prevent race conditions
  useEffect(() => {
    const fetchSealedBidData = async () => {
      if (!publicClient || !listingId || !listing || !isOpen) return;
      
      const strategyName = getStrategyName(listing.strategy);
      if (strategyName !== "Sealed Bid Auction") {
        setSealedBidPhase(null);
        setSealedBidParams(null);
        return;
      }

      try {
        console.log(`🔒 Fetching sealed bid phase for listing ${listingId}`);
        
        const [phase, params] = await Promise.all([
          getSealedBidPhase(BigInt(listingId)),
          getSealedBidParams(
            publicClient,
            CONTRACTS.DomainAuctionHouse as `0x${string}`,
            BigInt(listingId)
          )
        ]);
        
        console.log(`✅ Sealed bid phase fetched:`, phase);
        setSealedBidPhase(phase);
        setSealedBidParams(params);
      } catch (e: any) {
        console.error("Failed to fetch sealed bid data:", e);
        // Only set error state after a retry
        setTimeout(async () => {
          try {
            const phase = await getSealedBidPhase(BigInt(listingId));
            console.log(`✅ Sealed bid phase fetched on retry:`, phase);
            setSealedBidPhase(phase);
          } catch (retryError) {
            console.error("Retry failed, setting error state:", retryError);
            setSealedBidPhase({
              phase: -1,
              phaseDescription: "ERROR",
              timeRemaining: 0,
              error: e?.message ?? "Unknown error",
            });
          }
        }, 1000);
      }
    };

    fetchSealedBidData();
  }, [listingId, publicClient, listing, isOpen, getSealedBidPhase]);

  // Fetch NFT image from metadata
  useEffect(() => {
    const fetchImage = async () => {
      if (!publicClient || !listing || !isOpen) return;
      
      setImageLoading(true);
      try {
        console.log(`🖼️ Fetching NFT image for token ${listing.tokenId}`);
        
        const imageResult = await fetchNftImage({
          client: publicClient,
          nft: CONTRACTS.DomainNFT,
          tokenId: BigInt(listing.tokenId),
          ipfsGateway: "https://cloudflare-ipfs.com/ipfs/",
        });
        
        console.log(`✅ NFT image fetched:`, imageResult);
        setNftImage(imageResult);
      } catch (error) {
        console.error("Failed to fetch NFT image:", error);
        setNftImage(null);
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();
  }, [listing, publicClient, isOpen]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin dark:border-blue-400 dark:border-t-blue-300"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Loading auction details...
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !listing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl dark:bg-gray-900 dark:border-gray-700">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2 dark:text-red-400">⚠️ Error</div>
            <p className="text-gray-600 dark:text-gray-300">Failed to load auction details</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatPrice = (priceWei: string) => {
    try {
      const ethValue = parseFloat(formatEther(priceWei));
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const strategyName = getStrategyName(listing.strategy);
  const currentPrice = highestBid?.amount || listing.reservePrice;

  // Get status info based on contract status and sealed bid phase
  // Sealed Bid: Use getCurrentPhase to check status (phase 1=commit, 2=reveal, 3=completed/ended)
  // English/Dutch: Use contract listings status (1=listed, 2=live, 3=ended)
  const getStatusInfo = () => {
    const isSealed = strategyName === "Sealed Bid Auction";
    
    if (isSealed && sealedBidPhase) {
      // For sealed bid auctions, use getCurrentPhase for more accurate status
      if (sealedBidPhase.phase === 1) {
        return {
          text: "COMMIT PHASE",
          className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
        };
      } else if (sealedBidPhase.phase === 2) {
        return {
          text: "REVEAL PHASE", 
          className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        };
      } else if (sealedBidPhase.phase === 3) {
        return {
          text: "ENDED",
          className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        };
      } else if (sealedBidPhase.phase === -1) {
        return {
          text: "ERROR",
          className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        };
      }
    }
    
    // For Dutch auctions, if there's a highest bid, show as ENDED
    if (strategyName === "Dutch Auction" && highestBid && BigInt(highestBid.amount) > BigInt(0)) {
      return {
        text: "ENDED",
        className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
      };
    }
    
    // For English/Dutch auctions, use contract listings status (1=listed, 2=live, 3=ended)
    if (auctionStatus === 1) {
      return {
        text: "LISTED",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
      };
    } else if (auctionStatus === 2) {
      return {
        text: "LIVE",
        className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
      };
    } else if (auctionStatus === 3) {
      return {
        text: "ENDED",
        className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
      };
    } else {
      // Fallback to GraphQL status if contract status not available
      return listing.status === "Listed"
        ? {
            text: "LIVE",
            className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
          }
        : {
            text: "ENDED",
            className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
          };
    }
  };

  const statusInfo = getStatusInfo();
  const isAuctionEnded = () => {
    const isSealed = strategyName === "Sealed Bid Auction";
    if (isSealed && sealedBidPhase) {
      // For sealed bid auctions, check using getCurrentPhase: phase 3 = completed
      return sealedBidPhase.phase === 3;
    }
    
    // For Dutch auctions, if there's a highest bid, the auction is ended (first buyer wins)
    if (strategyName === "Dutch Auction" && highestBid && BigInt(highestBid.amount) > BigInt(0)) {
      return true;
    }
    
    // For English/Dutch auctions, check using contract listings: status 3 = ended
    return auctionStatus === 3;
  };

  // Convert to compatible format for BidDialog
  const listingForDialog: Listing & { metadata?: NFTMetadata } = {
    id: listing.id,
    seller: listing.seller as `0x${string}`,
    nft: listing.nft as `0x${string}`,
    tokenId: listing.tokenId,
    paymentToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    reservePrice: listing.reservePrice,
    startTime: listing.startTime,
    endTime: listing.endTime,
    strategy: listing.strategy as `0x${string}`,
    status: listing.status as any,
    winner: listing.winner as `0x${string}` | null,
    winningBid: listing.winningBid,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    metadata: listing.metadata,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-white border border-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-blue-900 text-center dark:text-blue-300">
              Auction Details
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Auction Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 dark:text-blue-300">
                Auction Info
              </h3>

              {/* Domain Name */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 dark:text-gray-400">Domain</div>
                <div className="font-bold text-xl text-blue-800 dark:text-blue-300">
                  {listing.metadata?.name ||
                    `Token #${listing.tokenId.slice(-8)}`}
                  <span className="text-gray-500 text-sm ml-1 dark:text-gray-400">
                    {listing.metadata?.tld || ".eth"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 dark:text-gray-400">Status</div>
                <Badge className={statusInfo.className}>
                  {statusInfo.text === "LIVE" || statusInfo.text === "COMMIT PHASE" || statusInfo.text === "REVEAL PHASE" ? "🟢" : 
                   statusInfo.text === "LISTED" ? "📝" :
                   statusInfo.text === "ENDED" ? "🔴" : 
                   statusInfo.text === "ERROR" ? "⚠️" : "🔴"} {statusInfo.text}
                </Badge>
              </div>

              {/* Auction Type */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 dark:text-gray-400">Auction Type</div>
                <Badge className="bg-blue-100 text-black border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800/40">
                  {strategyName}
                </Badge>
              </div>


              {/* Current/Reserve Price */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                  {highestBid ? "Current Price" : "Reserve Price"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(currentPrice)}
                  </span>
                  <Image
                    src="/images/LogoCoin/eth-logo.svg"
                    alt="ETH"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </div>
              </div>

              {/* Minimum Deposit for Sealed Bid Auctions */}
              {strategyName === "Sealed Bid Auction" && sealedBidParams && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                    Minimum Deposit
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(sealedBidParams.minDeposit.toString())}
                    </span>
                    <Image
                      src="/images/LogoCoin/eth-logo.svg"
                      alt="ETH"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Required to place a sealed bid
                  </div>
                </div>
              )}

              {/* Winner - Show for Dutch auctions with a highest bid */}
              {(strategyName === "Dutch Auction" && highestBid && BigInt(highestBid.amount) > BigInt(0)) && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1 dark:text-gray-400">Winner</div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                    <span className="text-lg">🏆</span>
                    <div>
                      <div className="font-mono text-sm text-green-800 dark:text-green-300">
                        {formatAddress(highestBid.bidder)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Won at {formatPrice(highestBid.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Seller */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 dark:text-gray-400">Seller</div>
                <div className="font-mono text-sm text-gray-800 dark:text-gray-300">
                  {formatAddress(listing.seller)}
                </div>
              </div>

              {/* Times */}
              {(listing.startTime !== "0" || listing.endTime !== "0") && (
                <div className="space-y-2">
                  {listing.startTime !== "0" && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Auction Start:
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-300">
                        {formatTimestamp(listing.startTime)}
                      </div>
                    </div>
                  )}
                  {listing.endTime !== "0" && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Auction End:</div>
                      <div className="text-sm text-gray-800 dark:text-gray-300">
                        {formatTimestamp(listing.endTime)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {isAuctionEnded() && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {strategyName === "Dutch Auction" && highestBid 
                        ? "🎉 Auction won! First buyer secured the domain."
                        : "✅ This auction has ended successfully."
                      }
                    </p>
                  </div>
                )}
                {strategyName === "Sealed Bid Auction" && sealedBidPhase && sealedBidPhase.phase === 2 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      👁️ Auction is in reveal phase. Bidding is closed.
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setIsBidDialogOpen(true);
                  }}
                  className="text-xs w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                  disabled={isAuctionEnded() || (strategyName === "Sealed Bid Auction" && sealedBidPhase !== null && sealedBidPhase.phase !== 1)}
                >
                  {strategyName === "Dutch Auction"
                    ? "Purchase Now"
                    : strategyName === "Sealed Bid Auction"
                    ? sealedBidPhase?.phase === 1
                      ? "Place Sealed Bid"
                      : sealedBidPhase?.phase === 2
                      ? "Reveal Phase Active"
                      : isAuctionEnded()
                      ? "Auction Completed"
                      : "Place Bid"
                    : "Place Bid"}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Middle Column - NFT Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4 mx-auto dark:from-blue-900/30 dark:to-blue-800/30 overflow-hidden">
                  {imageLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin dark:border-blue-400 dark:border-t-blue-300"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">Loading image...</span>
                    </div>
                  ) : nftImage?.imageUrl ? (
                    <Image
                      src={nftImage.imageUrl}
                      alt="NFT Preview"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => {
                        console.error("Failed to load NFT image, falling back to default");
                        setNftImage(null);
                      }}
                    />
                  ) : (
                    <Image
                      src="/images/logo/doma-logo-2.jpg"
                      alt="Default NFT Preview"
                      width={150}
                      height={100}
                      className="rounded-full"
                    />
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">NFT Preview</div>
                <div className="text-xs text-gray-500 mt-1 mb-4 dark:text-gray-500">
                  Token ID: {listing.tokenId.slice(-12)}
                </div>

                {/* Sealed Bid Phase Information - Enhanced UX */}
                {strategyName === "Sealed Bid Auction" && (
                  <div className="mb-6">
                    {sealedBidPhase !== null ? (
                      <div className="space-y-3">
                        {/* Phase Progress Indicator */}
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Auction Progress</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs font-medium ${
                              sealedBidPhase.phase === 1 
                                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                                : sealedBidPhase.phase === 2
                                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                                : sealedBidPhase.phase === 3
                                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                                : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                            }`}
                          >
                            {sealedBidPhase.phase === -1 ? "Error" : `Phase ${sealedBidPhase.phase}`}
                          </Badge>
                        </div>

                        {/* Phase Steps Visualization */}
                        <div className="flex items-center justify-between relative">
                          {/* Step 1: Commit */}
                          <div className="flex flex-col items-center space-y-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              sealedBidPhase.phase >= 1 
                                ? "bg-blue-500 text-white shadow-md" 
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}>
                              {sealedBidPhase.phase === 1 ? "🔒" : sealedBidPhase.phase > 1 ? "✓" : "1"}
                            </div>
                            <div className={`text-xs text-center ${
                              sealedBidPhase.phase === 1 ? "text-blue-600 font-medium dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                            }`}>
                              Commit
                            </div>
                          </div>

                          {/* Progress Line 1-2 */}
                          <div className={`flex-1 h-0.5 mx-2 ${
                            sealedBidPhase.phase >= 2 ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                          }`}></div>

                          {/* Step 2: Reveal */}
                          <div className="flex flex-col items-center space-y-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              sealedBidPhase.phase >= 2 
                                ? sealedBidPhase.phase === 2 
                                  ? "bg-amber-500 text-white shadow-md" 
                                  : "bg-green-500 text-white shadow-md"
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}>
                              {sealedBidPhase.phase === 2 ? "👁️" : sealedBidPhase.phase > 2 ? "✓" : "2"}
                            </div>
                            <div className={`text-xs text-center ${
                              sealedBidPhase.phase === 2 ? "text-amber-600 font-medium dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
                            }`}>
                              Reveal
                            </div>
                          </div>

                          {/* Progress Line 2-3 */}
                          <div className={`flex-1 h-0.5 mx-2 ${
                            sealedBidPhase.phase >= 3 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                          }`}></div>

                          {/* Step 3: Complete */}
                          <div className="flex flex-col items-center space-y-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              sealedBidPhase.phase >= 3 
                                ? "bg-green-500 text-white shadow-md" 
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}>
                              {sealedBidPhase.phase >= 3 ? "✅" : "3"}
                            </div>
                            <div className={`text-xs text-center ${
                              sealedBidPhase.phase === 3 ? "text-green-600 font-medium dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                            }`}>
                              Complete
                            </div>
                          </div>
                        </div>

                        {/* Current Phase Details */}
                        <div className={`p-4 rounded-lg border-l-4 text-center ${
                          sealedBidPhase.phase === 1 
                            ? "bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-600"
                            : sealedBidPhase.phase === 2
                            ? "bg-amber-50 border-amber-400 dark:bg-amber-900/20 dark:border-amber-600"
                            : sealedBidPhase.phase === 3
                            ? "bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-600"
                            : "bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600"
                        }`}>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-3xl">
                              {sealedBidPhase.phase === 1 && "🔒"}
                              {sealedBidPhase.phase === 2 && "👁️"}
                              {sealedBidPhase.phase === 3 && "🎉"}
                              {sealedBidPhase.phase === -1 && "⚠️"}
                            </div>
                            <div>
                              <div className={`font-semibold text-base ${
                                sealedBidPhase.phase === 1 ? "text-blue-800 dark:text-blue-200"
                                : sealedBidPhase.phase === 2 ? "text-amber-800 dark:text-amber-200"
                                : sealedBidPhase.phase === 3 ? "text-green-800 dark:text-green-200"
                                : "text-red-800 dark:text-red-200"
                              }`}>
                                {sealedBidPhase.phase === 1 && "Commit Phase Active"}
                                {sealedBidPhase.phase === 2 && "Reveal Phase Active"}
                                {sealedBidPhase.phase === 3 && "Auction Completed"}
                                {sealedBidPhase.phase === -1 && "Phase Error"}
                              </div>
                              <div className={`text-sm mt-1 ${
                                sealedBidPhase.phase === 1 ? "text-blue-700 dark:text-blue-300"
                                : sealedBidPhase.phase === 2 ? "text-amber-700 dark:text-amber-300"
                                : sealedBidPhase.phase === 3 ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                              }`}>
                                {sealedBidPhase.phase === 1 && "Bidders can submit their sealed bids with deposits"}
                                {sealedBidPhase.phase === 2 && "Bidders must reveal their sealed bids to claim victory"}
                                {sealedBidPhase.phase === 3 && "The auction has concluded and winner determined"}
                                {sealedBidPhase.phase === -1 && "Unable to determine current auction phase"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : !loading && (
                      <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                        <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin dark:border-blue-600 dark:border-t-blue-300"></div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading auction phase...</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Auction Start and End Times - ListingGrid Style */}
                {auctionTimes && (
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Auction Start:</span>
                      <span>
                        {new Date(auctionTimes.startTime * 1000).toLocaleString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Auction End:</span>
                      <span>
                        {new Date(auctionTimes.endTime * 1000).toLocaleString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Chain - ListingGrid Style */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-blue-800 dark:text-blue-300">Chain</span>
                  <div className="flex items-center gap-1">
                    <Image
                      src="/images/logo/domaLogo.svg"
                      alt="Doma Chain"
                      width={50}
                      height={20}
                      className="rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Bid History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 dark:text-blue-300">
                Bid History
              </h3>

              {allBids.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-2xl mb-2">📭</div>
                  <div className="text-sm">No bids yet</div>
                  <div className="text-xs mt-1">
                    Be the first to place a bid!
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allBids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`p-3 rounded-lg border ${
                        index === 0
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {formatAddress(bid.bidder)}
                        </div>
                        {index === 0 && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 dark:bg-blue-800 dark:text-blue-200">
                            Highest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(bid.amount)}
                        </span>
                        <Image
                          src="/images/LogoCoin/eth-logo.svg"
                          alt="ETH"
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(bid.timestamp)}
                      </div>
                      {bid.transactionHash && (
                        <div className="text-xs mt-1 font-mono">
                          <Link
                            href={`https://explorer-testnet.doma.xyz/tx/${bid.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 hover:underline transition-colors cursor-pointer flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
                          >
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
                            View Transaction Hash
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bid Dialog */}
      <BidDialog
        isOpen={isBidDialogOpen}
        onClose={() => setIsBidDialogOpen(false)}
        listing={listingForDialog}
      />
    </>
  );
}
