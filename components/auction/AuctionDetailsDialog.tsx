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
  const [auctionTimes, setAuctionTimes] = useState<{startTime: number, endTime: number} | null>(null);
  const { listing, highestBid, allBids, loading, error } = useAuctionDetails(listingId);
  const publicClient = usePublicClient();

  // Fetch auction times from contract - same as ListingGrid
  useEffect(() => {
    const fetchAuctionTimes = async () => {
      if (!publicClient || !listingId) return;
      
      try {
        console.log(`🔍 Fetching auction times for listing ${listingId} from contract`);
        
        const listingData = await publicClient.readContract({
          address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
          abi: DOMAIN_AUCTION_HOUSE_ABI,
          functionName: 'listings',
          args: [BigInt(listingId)],
        }) as readonly any[];

        const startTime = Number(listingData[5]); // startTime is at index 5
        const endTime = Number(listingData[6]); // endTime is at index 6

        console.log(`⏰ Auction times for ${listingId}:`, {
          startTime: new Date(startTime * 1000).toLocaleString(),
          endTime: new Date(endTime * 1000).toLocaleString()
        });

        setAuctionTimes({ startTime, endTime });
      } catch (error) {
        console.error(`Failed to get auction times for listing ${listingId}:`, error);
      }
    };

    fetchAuctionTimes();
  }, [listingId, publicClient]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading auction details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !listing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
            <p className="text-gray-600">Failed to load auction details</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
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
        return `${ethValue.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-white border border-blue-200">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-blue-900 text-center">
              Auction Details
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Auction Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Auction Info</h3>
              
              {/* Domain Name */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Domain</div>
                <div className="font-bold text-xl text-blue-800">
                  {listing.metadata?.name || `Token #${listing.tokenId.slice(-8)}`}
                  <span className="text-gray-500 text-sm ml-1">
                    {listing.metadata?.tld || ".eth"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <Badge 
                  className={`${
                    listing.status === 'Listed' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : listing.status === 'Sold'
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  🔴 {listing.status}
                </Badge>
              </div>

              {/* Auction Type */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Auction Type</div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {strategyName}
                </Badge>
              </div>

              {/* Current/Reserve Price */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">
                  {highestBid ? "Current Price" : "Reserve Price"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">
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

              {/* Seller */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Seller</div>
                <div className="font-mono text-sm text-gray-800">
                  {formatAddress(listing.seller)}
                </div>
              </div>

              {/* Times */}
              {(listing.startTime !== "0" || listing.endTime !== "0") && (
                <div className="space-y-2">
                  {listing.startTime !== "0" && (
                    <div>
                      <div className="text-sm text-gray-600">Auction Start:</div>
                      <div className="text-sm text-gray-800">
                        {formatTimestamp(listing.startTime)}
                      </div>
                    </div>
                  )}
                  {listing.endTime !== "0" && (
                    <div>
                      <div className="text-sm text-gray-600">Auction End:</div>
                      <div className="text-sm text-gray-800">
                        {formatTimestamp(listing.endTime)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setIsBidDialogOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={listing.status !== 'Listed'}
                >
                  {strategyName === "Dutch Auction" ? "Purchase Now" : "Place Bid"}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Middle Column - NFT Preview (placeholder) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Image src="/images/logo/doma-logo-2.jpg" alt="NFT Preview" width={150} height={100} className="rounded-full" />
                </div>
                <div className="text-sm text-gray-600">NFT Preview</div>
                <div className="text-xs text-gray-500 mt-1 mb-4">Token ID: {listing.tokenId.slice(-12)}</div>
                
                {/* Auction Start and End Times - ListingGrid Style */}
                {auctionTimes && (
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Auction Start:</span>
                      <span>
                        {new Date(auctionTimes.startTime * 1000).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Auction End:</span>
                      <span>
                        {new Date(auctionTimes.endTime * 1000).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Chain - ListingGrid Style */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="font-bold text-blue-800">
                    Chain
                  </span>
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Bid History</h3>
              
              {allBids.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">📭</div>
                  <div className="text-sm">No bids yet</div>
                  <div className="text-xs mt-1">Be the first to place a bid!</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allBids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`p-3 rounded-lg border ${
                        index === 0
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-xs text-gray-600">
                          {formatAddress(bid.bidder)}
                        </div>
                        {index === 0 && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                            Highest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-blue-600">
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
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(bid.timestamp)}
                      </div>
                      {bid.transactionHash && (
                        <div className="text-xs mt-1 font-mono">
                          <Link 
                            href={`https://explorer-testnet.doma.xyz/tx/${bid.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 hover:underline transition-colors cursor-pointer flex items-center gap-1"
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