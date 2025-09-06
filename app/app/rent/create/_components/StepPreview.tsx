"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Check,
  Shield,
  Clock,
  DollarSign,
  Hash,
  Loader2,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { formatUSD, shortAddress, parseUSDCInput } from "@/lib/rental/format";
import { useState, useEffect } from "react";
import { apolloClient } from "@/lib/graphql/client";
import { GET_NAME_FROM_TOKEN_QUERY } from "@/lib/graphql/queries";
import type {
  NameFromTokenResponse,
  NameFromTokenVariables,
  NFTMetadata,
} from "@/lib/graphql/types";

interface StepPreviewProps {
  nftAddress: string;
  tokenId: string;
  pricePerDay: string;
  securityDeposit: string;
  minDays: string;
  maxDays: string;
  onBack: () => void;
  onSubmit: () => void; // Step 1
  onCreateRental?: () => void; // Step 2
  onSetTerms?: () => void; // Step 3
  loading?: boolean;
  error?: string;
  flowStep?: string;
  flowDescription?: string;
  isPending?: boolean;
  isConfirming?: boolean;
  hash?: string;
  isCompleted?: boolean;
  listingId?: number | null;
  getCurrentStepNumber?: () => number;
  canExecuteStep?: (step: number) => boolean;
}

export default function StepPreview({
  nftAddress,
  tokenId,
  pricePerDay,
  securityDeposit,
  minDays,
  maxDays,
  onBack,
  onSubmit,
  onCreateRental,
  onSetTerms,
  loading,
  error,
  flowStep,
  flowDescription,
  isPending,
  isConfirming,
  hash,
  isCompleted,
  listingId,
  getCurrentStepNumber,
  canExecuteStep,
}: StepPreviewProps) {
  const [domainMetadata, setDomainMetadata] = useState<NFTMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const priceUSDC = parseUSDCInput(pricePerDay);
  const depositUSDC = parseUSDCInput(securityDeposit);
  const minDaysNum = parseInt(minDays);
  const maxDaysNum = parseInt(maxDays);
  const minEarning = priceUSDC * BigInt(minDaysNum);
  const maxEarning = priceUSDC * BigInt(maxDaysNum);

  const currentStepNumber = getCurrentStepNumber ? getCurrentStepNumber() : 0;

  const steps = [
    { number: 1, title: "Approve NFT", desc: "Permit vault to manage NFT", action: onSubmit, icon: Shield },
    { number: 2, title: "Create Rental", desc: "Deposit NFT & open listing", action: onCreateRental, icon: Hash },
    { number: 3, title: "Set Terms", desc: "Apply price & duration", action: onSetTerms, icon: DollarSign },
  ];

  const fetchNFTMetadata = async (tid: string): Promise<NFTMetadata> => {
    try {
      const { data } = await apolloClient.query<
        NameFromTokenResponse,
        NameFromTokenVariables
      >({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId: tid },
        errorPolicy: "all",
      });

      const name = data?.nameStatistics?.name;
      if (name) {
        const [sld, tld] = name.split(".");
        return { name: sld || name, tld: tld ? `.${tld}` : ".eth", description: `Domain: ${name}` };
      }
      return { name: `Domain-${tid.slice(-8)}`, tld: ".eth", description: `NFT Domain #${tid}` };
    } catch {
      return { name: `Unknown-${tid.slice(-8)}`, tld: ".eth", description: "Failed to load metadata" };
    }
  };

  useEffect(() => {
    if (tokenId) {
      setMetadataLoading(true);
      fetchNFTMetadata(tokenId).then((m) => {
        setDomainMetadata(m);
        setMetadataLoading(false);
      });
    }
  }, [tokenId]);

  const formatTokenId = (tid: string) => (tid && tid.length > 20 ? `${tid.slice(0, 10)}…${tid.slice(-10)}` : tid);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
              3
            </span>
            <div>
              <CardTitle className="text-base font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Review & Create
              </CardTitle>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Confirm details before publishing your listing
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* NFT meta */}
          <section className="rounded-xl border border-neutral-200/70 p-4 dark:border-neutral-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              <Hash className="h-4 w-4 text-neutral-500" />
              NFT Details
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900/40">
                <div className="text-neutral-500">Contract</div>
                <code className="mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
                  {shortAddress(nftAddress as any)}
                </code>
              </div>

              <div className="rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900/40">
                <div className="text-neutral-500">Token ID</div>
                <div className="mt-1 font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
                  {formatTokenId(tokenId)}
                </div>
              </div>

              <div className="rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900/40">
                <div className="text-neutral-500">Domain</div>
                <div className="mt-1">
                  {metadataLoading ? (
                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  ) : (
                    <Badge variant="outline" className="h-5 rounded-full px-2 text-[11px]">
                      {domainMetadata ? `${domainMetadata.name}${domainMetadata.tld}` : `domain${tokenId.slice(-6)}.eth`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl border border-neutral-200/70 p-4 dark:border-neutral-800">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              <DollarSign className="h-4 w-4 text-neutral-500" />
              Pricing & Terms
            </h3>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900/40">
                <div className="text-[12px] text-neutral-500">Daily Rate</div>
                <div className="mt-1 text-lg font-semibold">{formatUSD(priceUSDC)}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900/40">
                <div className="text-[12px] text-neutral-500">Deposit</div>
                <div className="mt-1 text-lg font-semibold">{formatUSD(depositUSDC)}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900/40">
                <div className="text-[12px] text-neutral-500">Min Days</div>
                <div className="mt-1 text-lg font-semibold">{minDaysNum}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900/40">
                <div className="text-[12px] text-neutral-500">Max Days</div>
                <div className="mt-1 text-lg font-semibold">{maxDaysNum}</div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-3 text-center text-sm dark:bg-green-900/20">
                Min earning: <span className="font-semibold">{formatUSD(minEarning)}</span>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center text-sm dark:bg-green-900/20">
                Max earning: <span className="font-semibold">{formatUSD(maxEarning)}</span>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="rounded-xl border border-neutral-200/70 p-4 dark:border-neutral-800">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              <Clock className="h-4 w-4 text-neutral-500" />
              Create Listing Steps
            </h3>

            <ul className="space-y-2">
              {steps.map((s) => {
                const Icon = s.icon;
                const isCurrent = currentStepNumber === s.number;
                const isDone = currentStepNumber > s.number;
                const canRun = canExecuteStep ? canExecuteStep(s.number) : false;
                const executing = isCurrent && (isPending || isConfirming);

                return (
                  <li
                    key={s.number}
                    className="flex items-center justify-between rounded-lg border border-neutral-200/70 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={[
                          "grid h-7 w-7 place-items-center rounded-full",
                          isDone
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : isCurrent
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
                        ].join(" ")}
                      >
                        {executing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isDone ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Icon className="h-3.5 w-3.5" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          Step {s.number}: {s.title}
                        </div>
                        <div className="truncate text-[12px] text-neutral-500">{s.desc}</div>
                      </div>
                    </div>

                    {isDone ? (
                      <Badge variant="outline" className="h-6 rounded-full px-2 text-[11px]">
                        Done
                      </Badge>
                    ) : (
                      canRun &&
                      s.action && (
                        <Button
                          size="sm"
                          onClick={s.action}
                          disabled={executing}
                          className="h-8 rounded-md bg-blue-600 px-3 text-[12px] hover:bg-blue-700"
                        >
                          {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : s.title}
                        </Button>
                      )
                    )}
                  </li>
                );
              })}
            </ul>

            {currentStepNumber > 0 && hash && (
              <div className="mt-3 border-t border-neutral-200 pt-3 text-xs dark:border-neutral-800">
                <a
                  href={`https://explorer-testnet.doma.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-300"
                >
                  View transaction <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {isCompleted && listingId !== null && (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm dark:bg-emerald-900/20">
                <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-4 w-4" />
                  Listing #{listingId} is live.
                </div>
              </div>
            )}
          </section>

          {/* Security note */}
          {!loading && !isCompleted && (
            <Alert className="border-blue-200 bg-blue-50/80 text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
              <AlertDescription className="text-[13px]">
                Your NFT is held by a smart-contract vault during rentals. You
                keep ownership and can unlist anytime when not rented.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={onBack} disabled={loading || isCompleted}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {isCompleted ? (
              <Button
                onClick={() => (window.location.href = "/app/rent/manage")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="mr-2 h-4 w-4" />
                View My Listings
              </Button>
            ) : (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Run the steps above to publish your listing.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compact guide */}
      <Card className="rounded-2xl border border-neutral-200/70 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Quick Guide
          </h4>
          <ol className="grid gap-2 text-[13px] sm:grid-cols-3">
            <li className="rounded-lg bg-white p-3 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
              1) Approve the NFT
            </li>
            <li className="rounded-lg bg-white p-3 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
              2) Create the rental listing
            </li>
            <li className="rounded-lg bg-white p-3 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
              3) Set terms & go live
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
