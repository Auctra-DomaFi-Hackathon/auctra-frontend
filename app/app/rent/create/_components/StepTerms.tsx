"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  Banknote,
  CalendarRange,
  BadgeCheck,
  Lightbulb,
} from "lucide-react";
import { formatUSD, parseUSDCInput } from "@/lib/rental/format";

interface StepTermsProps {
  pricePerDay: string;
  securityDeposit: string;
  minDays: string;
  maxDays: string;
  onPricePerDayChange: (value: string) => void;
  onSecurityDepositChange: (value: string) => void;
  onMinDaysChange: (value: string) => void;
  onMaxDaysChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
  error?: string;
}

export default function StepTerms(props: StepTermsProps) {
  const {
    pricePerDay,
    securityDeposit,
    minDays,
    maxDays,
    onPricePerDayChange,
    onSecurityDepositChange,
    onMinDaysChange,
    onMaxDaysChange,
    onBack,
    onNext,
    loading,
    error,
  } = props;

  const isValid =
    pricePerDay &&
    securityDeposit &&
    minDays &&
    maxDays &&
    parseInt(minDays) > 0 &&
    parseInt(maxDays) >= parseInt(minDays);

  // Preview calculations
  const priceUSDC = parseUSDCInput(pricePerDay);
  const depositUSDC = parseUSDCInput(securityDeposit);
  const minDaysNum = parseInt(minDays) || 0;
  const maxDaysNum = parseInt(maxDays) || 0;

  return (
    <div className="space-y-6">
      {/* MAIN CARD */}
      <Card className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
              2
            </span>
            <div>
              <CardTitle className="text-base font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Rental Terms
              </CardTitle>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Set your pricing and rental duration limits
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* PRICING */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Pricing
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Daily rate */}
              <div>
                <Label
                  htmlFor="price-per-day"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Daily Rate (USD) *
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="price-per-day"
                    inputMode="decimal"
                    type="number"
                    step="0.01"
                    placeholder="1.50"
                    value={pricePerDay}
                    onChange={(e) => onPricePerDayChange(e.target.value)}
                    className="pr-14 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs font-medium text-neutral-500">
                    USD
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  How much you charge per day
                </p>
              </div>

              {/* Deposit */}
              <div>
                <Label
                  htmlFor="security-deposit"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Security Deposit (USD) *
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="security-deposit"
                    inputMode="decimal"
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    value={securityDeposit}
                    onChange={(e) => onSecurityDepositChange(e.target.value)}
                    className="pr-14 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs font-medium text-neutral-500">
                    USD
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Refundable deposit for security
                </p>
              </div>
            </div>
          </section>

          {/* DURATION */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Rental Duration
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Min days */}
              <div>
                <Label
                  htmlFor="min-days"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Minimum Days *
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="min-days"
                    type="number"
                    min="1"
                    value={minDays}
                    onChange={(e) => onMinDaysChange(e.target.value)}
                    className="pr-12 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs font-medium text-neutral-500">
                    days
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Shortest rental period allowed
                </p>
              </div>

              {/* Max days */}
              <div>
                <Label
                  htmlFor="max-days"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Maximum Days *
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="max-days"
                    type="number"
                    min="1"
                    value={maxDays}
                    onChange={(e) => onMaxDaysChange(e.target.value)}
                    className="pr-12 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs font-medium text-neutral-500">
                    days
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Longest rental period allowed
                </p>
              </div>
            </div>
          </section>

          {/* PREVIEW */}
          {isValid && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900/50 dark:bg-blue-900/20">
              <div className="mb-2 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Rental Preview
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                  Daily: {formatUSD(priceUSDC)}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                  Deposit: {formatUSD(depositUSDC)}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                  Min: {minDaysNum} day{minDaysNum !== 1 ? "s" : ""}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-transparent dark:text-blue-300 dark:ring-blue-800">
                  Max: {maxDaysNum} day{maxDaysNum !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* ACTIONS */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={onBack} className="text-sm">
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid || loading}
              className="bg-blue-600 text-sm hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Next Step"}
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TIPS */}
      <Card className="rounded-2xl border border-yellow-200 bg-yellow-50/80 dark:border-yellow-900/50 dark:bg-yellow-900/15">
        <CardContent className="p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Pricing Tips
            </h3>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-xs text-yellow-800 dark:text-yellow-400">
            <li>Research similar domains to price competitively</li>
            <li>Higher deposits discourage misuse but may reduce interest</li>
            <li>Flexible duration ranges attract more renters</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
