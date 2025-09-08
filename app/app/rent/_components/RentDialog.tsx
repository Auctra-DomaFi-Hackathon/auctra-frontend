"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ListingWithMeta } from "@/lib/rental/types";
import { formatUSD } from "@/lib/rental/format";
import { calculateRentCost } from "@/lib/rental/mockService";
import { useRentDomain } from "@/lib/rental/hooks";
import { useToast } from "@/hooks/use-toast";

interface RentDialogProps {
  listing: ListingWithMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RentDialog({ listing, open, onOpenChange }: RentDialogProps) {
  const [days, setDays] = useState(listing.listing.minDays);
  const { rentDomain, loading } = useRentDomain();
  const { toast } = useToast();

  const costBreakdown = calculateRentCost(
    listing.listing.pricePerDay,
    days,
    listing.listing.securityDeposit
  );

  const handleDaysChange = (value: string) => {
    const numDays = parseInt(value);
    if (!isNaN(numDays)) {
      const clampedDays = Math.max(
        listing.listing.minDays,
        Math.min(listing.listing.maxDays, numDays)
      );
      setDays(clampedDays);
    }
  };

  const handleRent = async () => {
    try {
      await rentDomain(listing.id, days);
      toast({
        title: "Success!",
        description: `Successfully rented ${listing.domain} for ${days} days!`,
      });
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to rent domain",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dark-first surface with subtle border + shadow for glassy card feel */}
      <DialogContent
        className="
          sm:max-w-md 
          bg-white dark:bg-[#0b1220] 
          border border-gray-200 dark:border-white/10 
          shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]
          text-gray-900 dark:text-slate-200
          backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-white/[0.03]
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Rent <span className="text-sky-500">{listing.domain}</span>
          </DialogTitle>

          {/* Stepper */}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white">
                1
              </span>
              <span className="text-slate-400">Approve</span>
            </div>
            <div className="h-px w-8 bg-slate-300 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-500/50 text-white">
                2
              </span>
              <span className="text-slate-500">Rent</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Days Selection */}
          <div>
            <Label
              htmlFor="days"
              className="text-sm font-medium text-gray-700 dark:text-slate-300"
            >
              Rental Period (days)
            </Label>

            <div className="mt-2">
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => handleDaysChange(e.target.value)}
                min={listing.listing.minDays}
                max={listing.listing.maxDays}
                className="
                  w-full
                  bg-white dark:bg-white/[0.04]
                  border-gray-300 dark:border-white/10
                  text-gray-900 dark:text-slate-100
                  placeholder-gray-500 dark:placeholder-slate-400
                  focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-sky-500
                "
                placeholder={`${listing.listing.minDays} - ${listing.listing.maxDays}`}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                <span className="font-medium text-slate-300">Period</span>{" "}
                <span className="mx-1">•</span>
                Min {listing.listing.minDays} <span className="mx-1">•</span> Max{" "}
                {listing.listing.maxDays} days
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div
            className="
              rounded-xl p-4 
              bg-gray-50 dark:bg-white/[0.04]
              border border-gray-200 dark:border-white/10
            "
          >
            <h4 className="mb-3 font-medium text-gray-900 dark:text-slate-100">
              Cost Breakdown
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">
                  Base price ({days} × {formatUSD(listing.listing.pricePerDay)}/day)
                </span>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {formatUSD(costBreakdown.basePrice)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">
                  Protocol fee (2%)
                </span>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {formatUSD(costBreakdown.protocolFee)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">
                  Security deposit (refundable)
                </span>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {formatUSD(costBreakdown.securityDeposit)}
                </span>
              </div>

              <Separator className="my-2 bg-gray-300 dark:bg-white/10" />

              <div className="flex justify-between font-semibold">
                <span className="text-gray-900 dark:text-slate-100">Total</span>
                <span className="text-lg text-gray-900 dark:text-slate-100">
                  {formatUSD(costBreakdown.total)}
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-sky-200/60 bg-sky-50 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
              <p className="text-xs text-sky-700 dark:text-sky-300">
                The security deposit will be returned after the rental period ends,
                minus any damages or violations.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="
                flex-1
                bg-white dark:bg-white/[0.03]
                border-gray-300 dark:border-white/10
                text-gray-700 dark:text-slate-300
                hover:bg-gray-50 dark:hover:bg-white/[0.06]
              "
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleRent}
              disabled={loading}
              className="
                flex-1 
                bg-sky-600 hover:bg-sky-700
                dark:bg-sky-600 dark:hover:bg-sky-500
                text-white disabled:opacity-50
                focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-sky-400
              "
            >
              {loading ? "Processing..." : `Rent for ${formatUSD(costBreakdown.total)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
