"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import type { Listing, NFTMetadata } from "@/lib/graphql/types";

interface BidSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: (Listing & { metadata?: NFTMetadata }) | null;
  transactionHash: string | undefined;
  bidAmount: string;
  bidType: "bid" | "purchase" | "commit";
}

export default function BidSuccessDialog({
  isOpen,
  onClose,
  listing,
  transactionHash,
  bidAmount,
  bidType,
}: BidSuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  console.log('🎉 BidSuccessDialog props:', {
    isOpen,
    listing: listing?.id,
    transactionHash,
    bidAmount,
    bidType
  });

  if (!listing) {
    console.log('❌ BidSuccessDialog: Missing listing');
    return null;
  }

  if (!transactionHash) {
    console.log('⏳ BidSuccessDialog: Waiting for transaction hash...');
    // Show loading state instead of returning null
  }

  const copyTransactionHash = async () => {
    if (!transactionHash) return;
    
    try {
      await navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy transaction hash:", error);
    }
  };

  const openBlockExplorer = () => {
    if (!transactionHash) return;
    
    // Doma Testnet explorer
    const explorerUrl = `https://explorer-testnet.doma.xyz/tx/${transactionHash}`;
    console.log('🔗 Opening explorer:', explorerUrl);
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };

  const getBidTypeText = () => {
    switch (bidType) {
      case "purchase":
        return "Purchase Successful!";
      case "commit":
        return "Bid Committed!";
      default:
        return "Bid Placed Successfully!";
    }
  };

  const getBidTypeDescription = () => {
    switch (bidType) {
      case "purchase":
        return "You have successfully purchased this domain at the current Dutch auction price.";
      case "commit":
        return "Your sealed bid has been committed. Remember to reveal it during the reveal phase.";
      default:
        return "Your bid has been placed successfully. You will be notified if you are outbid.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🎭 Dialog onOpenChange:', open)
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 border-0 shadow-2xl bg-white sm:rounded-2xl overflow-hidden"
        onPointerDownOutside={() => {
          // Prevent closing when clicking outside if we want to control it manually
          console.log('🎭 Pointer down outside')
        }}
        onEscapeKeyDown={() => {
          // Allow escape key to close
          console.log('🎭 Escape key pressed')
        }}
      >
          
          {/* Blue Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-100"></div>
              <div className="absolute bottom-6 left-16 w-1 h-1 bg-white rounded-full animate-pulse delay-200"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                🎉 {getBidTypeText()}
              </h2>
              <p className="text-white/90 text-sm">
                Your transaction has been confirmed on the blockchain
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-5">
            
            {/* Domain Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">
                    {listing.metadata?.name || `Token #${listing.tokenId.slice(-8)}`}
                    <span className="text-blue-600 font-medium">
                      {listing.metadata?.tld || ".eth"}
                    </span>
                  </h3>
                  <p className="text-sm text-blue-700">Domain Name</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-blue-900">{bidAmount} ETH</p>
                  <p className="text-sm text-blue-600">{bidType === 'purchase' ? 'Purchase Price' : 'Bid Amount'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-200">
                <div>
                  <p className="text-xs text-blue-600 uppercase tracking-wide">Listing ID</p>
                  <p className="font-semibold text-blue-900">#{listing.id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 uppercase tracking-wide">Auction Type</p>
                  <p className="font-semibold text-blue-900 capitalize">
                    {bidType === 'purchase' ? 'Dutch Auction' : bidType === 'commit' ? 'Sealed Bid' : 'English Auction'}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Transaction Details
              </h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Transaction Hash</span>
                  {transactionHash && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyTransactionHash}
                        className="h-8 w-8 p-0 hover:bg-blue-100 transition-colors"
                        title={copied ? "Copied!" : "Copy hash"}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-blue-700" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openBlockExplorer()}
                        className="h-8 w-8 p-0 hover:bg-blue-100 transition-colors"
                        title="View on explorer"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-700" />
                      </Button>
                    </div>
                  )}
                </div>
                {transactionHash ? (
                  <code className="text-xs text-blue-800 bg-white px-3 py-2 rounded-lg border border-blue-200 block break-all">
                    {transactionHash}
                  </code>
                ) : (
                  <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-xs text-blue-700">Generating transaction hash...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 text-center leading-relaxed">
                {getBidTypeDescription()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => openBlockExplorer()}
                disabled={!transactionHash}
                className="flex-1 flex items-center justify-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink className="h-4 w-4" />
                {transactionHash ? 'View on Doma Explorer' : 'Explorer (Waiting...)'}
              </Button>
              <Button 
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-md"
              >
                Great, Thanks! 🚀
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}