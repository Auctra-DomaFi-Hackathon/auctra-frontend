"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, ArrowRight, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Domain } from "@/types";

interface StepDomainProps {
  nftAddress: string;
  tokenId: string;
  selectedDomainId?: string;
  domains?: Domain[];
  onDomainSelect?: (domain: Domain) => void;
  onNext: () => void;
  loading?: boolean;
  error?: string;
}

export default function StepDomain({
  nftAddress,
  tokenId,
  selectedDomainId,
  domains = [],
  onDomainSelect,
  onNext,
  loading,
  error,
}: StepDomainProps) {
  const isValid = Boolean(selectedDomainId && nftAddress && tokenId);

  const formatTokenId = (tid: string) => {
    if (!tid || tid.length <= 12) return tid;
    return `${tid.slice(0, 6)}…${tid.slice(-6)}`;
  };

  return (
    <div className="space-y-6">
      {/* MAIN */}
      <Card className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
              1
            </span>
            <div>
              <CardTitle className="text-base font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Select Your Domain
              </CardTitle>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Choose a domain NFT from your wallet to list for rental
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Hint */}
          <Alert className="border-blue-200 bg-blue-50/70 text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
            <AlertDescription className="text-[13px] leading-relaxed">
              Your NFT is held in a non-custodial vault while listed. You keep
              ownership and can unlist anytime when not actively rented.
            </AlertDescription>
          </Alert>

          {/* Domains */}
          {domains.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Your Domains
                </h4>
                <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                  {domains.length} item{domains.length > 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {domains.map((d) => {
                  const selected = selectedDomainId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onDomainSelect?.(d)}
                      className={cn(
                        "text-left rounded-xl border bg-white p-4 transition-all dark:bg-neutral-900",
                        "hover:shadow-sm hover:ring-1 hover:ring-blue-200 dark:hover:ring-blue-900/50",
                        selected
                          ? "border-blue-300 ring-1 ring-blue-200 dark:border-blue-700/60 dark:ring-blue-900/60"
                          : "border-neutral-200 dark:border-neutral-800"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {d.name}
                            </span>
                            {selected && (
                              <Badge className="h-5 rounded-full bg-blue-600 px-2 text-[11px] text-white dark:bg-blue-500">
                                Selected
                              </Badge>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {d.tokenId && (
                              <span className="rounded-full bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-300 dark:ring-neutral-800">
                                ID: {formatTokenId(String(d.tokenId))}
                              </span>
                            )}
                            <span className="rounded-full bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-300 dark:ring-neutral-800">
                              Expires:{" "}
                              {d.expiresAt
                                ? new Date(d.expiresAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 gap-1 rounded-full px-2 text-[11px] dark:border-neutral-700"
                        >
                          <BadgeCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          Owned
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
              <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500" />
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                No Domains Found
              </h3>
              <p className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400">
                Connect a wallet with domain NFTs to continue.
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end pt-2">
            <Button
              onClick={onNext}
              disabled={!isValid || loading}
              className="bg-blue-600 text-sm hover:bg-blue-700"
            >
              {loading ? "Validating..." : "Next Step"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* HOW IT WORKS (compact) */}
      <Card className="rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-900/15">
        <CardContent className="p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <Info className="h-4 w-4" />
            How It Works
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-emerald-800 dark:text-emerald-300">
            <li>Select a domain you want to rent out</li>
            <li>Set pricing & duration on the next step</li>
            <li>Domain is held by a smart-contract vault while listed</li>
            <li>Earn passive income when renters use your domain</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
