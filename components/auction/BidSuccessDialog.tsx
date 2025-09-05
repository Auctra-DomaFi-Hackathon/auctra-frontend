"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  bidType: "bid" | "purchase" | "commit" | "reveal";
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
  if (!listing) return null;

  const copyTransactionHash = async () => {
    if (!transactionHash) return;
    try {
      await navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const openBlockExplorer = () => {
    if (!transactionHash) return;
    window.open(
      `https://explorer-testnet.doma.xyz/tx/${transactionHash}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const title =
    bidType === "purchase"
      ? "Purchase Successful"
      : bidType === "commit"
      ? "Commitment Successful"
      : bidType === "reveal"
      ? "Bid Revealed Successfully"
      : "Bid Successful";


  const sub =
    bidType === "purchase"
      ? "You purchased this domain at the current Dutch price."
      : bidType === "commit"
      ? "Your sealed bid has been committed. Remember to reveal it later."
      : bidType === "reveal"
      ? "Your bid has been revealed and is now competing to win the auction."
      : "Your bid is on-chain. We'll notify you if someone outbids you.";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          p-0 overflow-hidden bg-white border border-slate-200/70 shadow-xl
          rounded-xl sm:rounded-2xl
          /* lebar responsif */
          w-[min(92vw,36rem)]
          /* tinggi aman + scroll */
          max-h-[85vh] overflow-y-auto
        "
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
          <div className="mx-auto mb-3 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
          </div>
          <div className="text-center">
            <h2 className="text-base sm:text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">{sub}</p>
          </div>
        </div>

        <div className="h-px bg-slate-200/80" />

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Domain & Amount */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Domain
                </p>
                <p className="truncate font-medium text-slate-900">
                  {listing.metadata?.name || `Token #${listing.tokenId.slice(-8)}`}
                  <span className="text-blue-600">
                    {listing.metadata?.tld || ".eth"}
                  </span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {bidType === "purchase" ? "Price" : "Bid"}
                </p>
                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                  {bidAmount} ETH
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem label="Listing ID" value={`#${listing.id}`} />
              <InfoItem
                label="Auction"
                value={
                  bidType === "purchase"
                    ? "Dutch Auction"
                    : bidType === "commit"
                    ? "Sealed Bid Auction"
                    : "English Auction"
                }
              />
            </div>
          </div>

          {/* Tx Details */}
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
              Transaction
            </p>

            <div className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-slate-700">
                  Transaction Hash
                </span>

                <div className="flex gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={copyTransactionHash}
                    disabled={!transactionHash}
                    title={copied ? "Copied" : "Copy"}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-600" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={openBlockExplorer}
                    disabled={!transactionHash}
                    title="View on explorer"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              <div className="px-3 pb-3">
                {transactionHash ? (
                  <code
                    className="
                      block rounded-md border border-slate-200 bg-white
                      px-2.5 py-2 text-[11px] text-slate-800 font-mono
                      overflow-x-auto break-all
                    "
                  >
                    {transactionHash}
                  </code>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    <span className="text-[11px] text-slate-600">Waiting for hash…</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              variant="outline"
              onClick={openBlockExplorer}
              disabled={!transactionHash}
              className="w-full sm:flex-1 border-slate-300 text-slate-700 hover:bg-slate-50
              hover:text-gray-900"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Explorer
            </Button>
            <Button
              onClick={onClose}
              className="w-full sm:flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** ——— Subcomponent ——— */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
