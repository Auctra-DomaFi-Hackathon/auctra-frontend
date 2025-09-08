"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import KV from "./primitives/KV";
import { AuctionCard } from "@/features/auction/AuctionCard";

function cap(s: string) {
  return s?.charAt(0).toUpperCase() + s?.slice(1);
}
function money(n: number) {
  return `$${(n ?? 0).toLocaleString()}`;
}
function fmtDatetime(v?: string) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v!;
  }
}

export default function StepPreview({
  formData,
  back,
  busy,
  handleSubmit,
  setCurrentStep,
  wallet,
  isApproving,
  auctionStep,
  currentApproval,
  isApproved,
}: {
  formData: any;
  back: () => void;
  busy: boolean;
  handleSubmit: () => Promise<void> | void;
  setCurrentStep: (s: any) => void;
  wallet?: any;
  isApproving?: boolean;
  auctionStep?: string;
  currentApproval?: boolean;
  isApproved?: boolean;
}) {
  const progressOrder: Array<"list" | "criteria" | "strategy" | "start"> = [
    "list",
    "criteria",
    "strategy",
    "start",
  ];
  const stepIndex = auctionStep
    ? progressOrder.indexOf(auctionStep as any)
    : -1;
  const chip = (label: string, idx: number) => {
    const state =
      stepIndex > idx ? "done" : stepIndex === idx ? "current" : "idle";
    return (
      <div
        key={label}
        className={[
          "flex items-center gap-2 rounded-lg px-2.5 py-1 text-[11.5px] ring-1",
          state === "done" &&
            "bg-green-50 text-green-700 ring-green-200 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-800",
          state === "current" &&
            "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800",
          state === "idle" &&
            "bg-neutral-50 text-neutral-600 ring-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-400 dark:ring-neutral-800",
        ].join(" ")}
      >
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            state === "done" && "bg-green-600 dark:bg-green-300",
            state === "current" && "bg-blue-600 dark:bg-blue-300",
            state === "idle" && "bg-neutral-400 dark:bg-neutral-600",
          ].join(" ")}
        />
        {label}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Auction Preview
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Left: compact KV */}
            <div className="rounded-xl border border-neutral-200/70 p-4 text-[13px] leading-relaxed dark:border-neutral-800">
              <div className="grid gap-1.5">
                <KV k="Domain" v={formData.domain || "—"} />
                <KV k="Type" v={cap(formData.auctionType)} />
                {formData.auctionType === "english" && (
                  <KV k="Min Increment" v={`${formData.minIncrement ?? 0}%`} />
                )}
                {formData.auctionType === "dutch" && (
                  <>
                    <KV k="Start Price" v={money(formData.startPrice)} />
                    <KV k="End Price" v={money(formData.endPrice ?? 0)} />
                    <KV
                      k="Decay Interval"
                      v={`${formData.decayInterval ?? 0} min`}
                    />
                  </>
                )}
                {formData.auctionType === "sealed" && (
                  <>
                    <KV k="Minimum Bid" v={money(formData.minBid ?? 0)} />
                    <KV
                      k="Commit Window"
                      v={`${formData.commitWindow ?? 0} h`}
                    />
                    <KV
                      k="Reveal Window"
                      v={`${formData.revealWindow ?? 0} h`}
                    />
                  </>
                )}
                <KV k="Start" v={fmtDatetime(formData.startTime)} />
                <KV k="End" v={fmtDatetime(formData.endTime)} />
                <KV k="Auto-listing" v={formData.autoListing ? "Yes" : "No"} />
              </div>
            </div>

            {/* Right: Card preview */}
            <div className="rounded-xl border border-neutral-200/70 p-3 dark:border-neutral-800">
              <AuctionCard
                auction={{
                  id: "preview",
                  domainId: formData.domainId || "preview",
                  type: formData.auctionType,
                  status: "upcoming",
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  revealStart:
                    formData.auctionType === "sealed"
                      ? formData.startTime
                      : null,
                  revealEnd:
                    formData.auctionType === "sealed" ? formData.endTime : null,
                  parameters: {
                    dutch:
                      formData.auctionType === "dutch"
                        ? {
                            startPriceUsd: formData.startPrice,
                            floorPriceUsd: formData.endPrice || 0,
                            durationSec: formData.decayInterval || 3600,
                          }
                        : null,
                    sealed:
                      formData.auctionType === "sealed"
                        ? {
                            minDepositUsd: formData.minBid || 0,
                            minIncrementPct: (formData.minIncrement || 0) / 100,
                          }
                        : null,
                  },
                  feesBps: { protocol: 250, creator: 250 },
                  antiSnipingExtensionSec: 300,
                  activity: [],
                }}
                domain={{
                  id: formData.domainId || "preview",
                  name: formData.domain || "example.com",
                  tld: formData.domain
                    ? "." + formData.domain.split(".").pop()
                    : ".com",
                  status: "active",
                  expiresAt: new Date(
                    Date.now() + 365 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                  owner: "preview-owner",
                  dnsVerified: true,
                  trafficScore: 85,
                  renewalCostUsd: 12,
                  oracleReserveUsd: formData.reservePrice || 1000,
                  fairValueBandUsd: {
                    min: (formData.reservePrice || 1000) * 0.8,
                    max: (formData.reservePrice || 1000) * 1.2,
                  },
                  oracleConfidence: 0.85,
                  nftTokenId: null,
                  currentAuctionId: null,
                }}
              />
            </div>
          </div>

          {/* Minimal wallet & progress */}
          {wallet && (
            <div className="grid gap-3 rounded-xl border border-neutral-200/70 p-4 text-[12.5px] dark:border-neutral-800">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 ring-1 ring-neutral-200 dark:bg-neutral-900/40 dark:ring-neutral-800">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Wallet
                  </span>
                  <span
                    className={
                      wallet.isConnected
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {wallet.isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 ring-1 ring-neutral-200 dark:bg-neutral-900/40 dark:ring-neutral-800">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Network
                  </span>
                  <span className="inline-flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                    {wallet.isOnDomaTestnet ? (
                      <Image
                        src="/images/logo/domaLogo.svg"
                        alt="Doma"
                        width={44}
                        height={14}
                        className="rounded-sm opacity-80"
                      />
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 ring-1 ring-neutral-200 dark:bg-neutral-900/40 dark:ring-neutral-800">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Domain Approval
                  </span>
                  <span
                    className={
                      currentApproval || isApproved
                        ? "text-green-600 dark:text-green-400"
                        : isApproving
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-amber-600 dark:text-amber-400"
                    }
                  >
                    {currentApproval || isApproved
                      ? "Approved"
                      : isApproving
                      ? "Approving…"
                      : "Needs Approval"}
                  </span>
                </div>
              </div>

              {auctionStep && (
                <div className="flex flex-wrap items-center gap-2">
                  {["List", "Criteria", "Strategy", "Go Live"].map((label, i) =>
                    chip(label, i)
                  )}
                  {busy && (
                    <span className="ml-auto text-[11.5px] text-blue-600 dark:text-blue-400">
                      Confirm transactions in your wallet…
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={back}
              className="text-black h-9 rounded-lg border-neutral-300 text-[13px] dark:border-neutral-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={busy}
              className="h-9 rounded-lg bg-blue-600 text-[13px] hover:bg-blue-700"
            >
              {isApproving
                ? "Approving…"
                : auctionStep === "list"
                ? "Listing Domain"
                : auctionStep === "criteria"
                ? "Setting Criteria…"
                : auctionStep === "strategy"
                ? "Choosing Strategy…"
                : auctionStep === "start"
                ? "Going Live…"
                : busy
                ? "Processing…"
                : "Create Auction"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
