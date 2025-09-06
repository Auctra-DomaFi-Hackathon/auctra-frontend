"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

interface AuctionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  domain: string;
  auctionType: string;
  reservePrice: number | string;
  transactionHashes: {
    list?: string;
    criteria?: string;
    strategy?: string;
    goLive?: string;
  };
  /**
   * Optional: override base explorer URL (no trailing slash)
   * e.g. https://explorer-testnet.doma.xyz
   */
  explorerBaseUrl?: string;
}

export default function AuctionSuccessModalMinimal({
  isOpen,
  onClose,
  listingId,
  domain,
  auctionType,
  reservePrice,
  transactionHashes,
  explorerBaseUrl = "https://explorer-testnet.doma.xyz",
}: AuctionSuccessModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const steps = useMemo(
    () => [
      { key: "list", label: "List", hash: transactionHashes.list },
    ],
    [transactionHashes.list]
  );

  const short = (v?: string) => (v ? `${v.slice(0, 6)}…${v.slice(-4)}` : "—");
  const txUrl = (hash: string) => `${explorerBaseUrl}/tx/${hash}`;

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    const t = setTimeout(() => setCopied(null), 1600);
    // @ts-ignore — keep ref-less for minimalism
    t;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-white/70 px-5 py-4 dark:bg-neutral-900/70 backdrop-blur">
          <div className="shrink-0 rounded-full border border-blue-200 bg-blue-50 p-1.5 dark:border-blue-900/50 dark:bg-blue-950">
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogHeader className="p-0">
            <DialogTitle className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Auction created
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-5 px-5 py-5">
          {/* Primary summary */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Listing</span>
              <code className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                {listingId}
              </code>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Domain</div>
                <div className="truncate font-medium text-neutral-900 dark:text-neutral-100">{domain}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Type</div>
                <div className="capitalize text-neutral-900 dark:text-neutral-100">{auctionType} auction</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Reserve</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{reservePrice} ETH</div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <ul className="divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
              {steps.map((s) => (
                <li key={s.key} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[10px] font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950 dark:text-blue-300">
                      ✓
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{s.label}</span>
                  </div>

                  {s.hash ? (
                    <div className="flex items-center gap-1.5">
                      <code className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                        {short(s.hash)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => copy(s.hash!, s.key)}
                        aria-label={`Copy ${s.label} hash`}
                        title="Copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        aria-label={`Open ${s.label} in explorer`}
                        title="Open in explorer"
                      >
                        <a href={txUrl(s.hash)} target="_blank" rel="noreferrer noopener">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">pending…</span>
                  )}
                </li>
              ))}
            </ul>

            {copied && (
              <div className="px-4 pb-3 pt-2 text-center text-xs text-blue-700 dark:text-blue-300">
                {steps.find((x) => x.key === copied)?.label} hash copied
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose} className="sm:px-4">
              Close
            </Button>
            <Button onClick={onClose} className="bg-blue-600 text-white hover:bg-blue-700 sm:px-4">
              Create another auction
            </Button>
          </div>

          {/* Tiny footnote */}
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Your auction is live. Share the link and start accepting bids.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
