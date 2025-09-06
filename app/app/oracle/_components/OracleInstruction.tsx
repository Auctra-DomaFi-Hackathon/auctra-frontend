"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, ListOrdered } from "lucide-react";

export default function OracleInstructions() {
  return (
    <Card className="mt-6 rounded-2xl border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <CardTitle className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            <Info className="h-[16px] w-[16px] text-blue-600 dark:text-blue-300" />
            How Oracle Configuration Works
          </CardTitle>

          <Badge
            className="inline-flex h-5 w-auto items-center gap-1 rounded-full bg-blue-50 px-2 text-[10px] font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/60"
            aria-label="Quick Guide"
          >
            <ListOrdered className="h-3 w-3" />
            Quick Guide
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <ol
          className="
            grid gap-2
            [grid-template-columns:repeat(1,minmax(0,1fr))]
            xs:[grid-template-columns:repeat(2,minmax(0,1fr))]
            sm:[grid-template-columns:repeat(4,minmax(0,1fr))]
          "
        >
          {[
            ["Select Domain", "Pick a valid NFT"],
            ["Set Value", "USD valuation"],
            ["Set Expiry", "≥ 30 days"],
            ["Confirm Transaction", "Approve on-chain"],
          ].map(([title, sub], i) => (
            <li
              key={i}
              className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40"
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {i + 1}
                </span>
                <span className="text-[1rem] font-medium text-neutral-900 dark:text-neutral-100">
                  {title}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
                {sub}
              </p>
            </li>
          ))}
        </ol>

        {/* Details */}
        <div className="grid gap-3 md:grid-cols-2">
          {/* Requirements */}
          <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-2 text-[12px] font-semibold text-blue-600 dark:text-blue-300">
              Requirements
            </h3>
            <ul className="space-y-1.5 text-[12px]">
              {[
                "Valid NFT token ID",
                "Value > $0 USD (min $1)",
                "Expiry ≥ 30 days from now",
                "Status flagged: isPremium = true",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-300" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* After Configuration */}
          <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-2 text-[12px] font-semibold text-blue-600 dark:text-blue-300">
              After Configuration
            </h3>
            <ul className="space-y-1.5 text-[12px]">
              {[
                "Domain becomes collateral-eligible",
                "Oracle returns premium status + USD value",
                "Supply domain to borrow stablecoins (e.g., USDC)",
                "Data stored on-chain via MockDomainOracle",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-300" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
