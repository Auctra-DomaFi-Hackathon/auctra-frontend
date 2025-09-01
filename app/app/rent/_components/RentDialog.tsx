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
      // Trigger a refetch in the parent component would be done via context/state management
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rent domain",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Rent {listing.domain}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Days Selection */}
          <div>
            <Label htmlFor="days" className="text-sm font-medium text-gray-700">
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
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: {listing.listing.minDays} days, Max: {listing.listing.maxDays} days
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Base price ({days} × {formatUSD(listing.listing.pricePerDay)}/day)
                </span>
                <span className="font-medium">{formatUSD(costBreakdown.basePrice)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Protocol fee (2%)</span>
                <span className="font-medium">{formatUSD(costBreakdown.protocolFee)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Security deposit (refundable)</span>
                <span className="font-medium">{formatUSD(costBreakdown.securityDeposit)}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-semibold">
                <span>Total Cost</span>
                <span className="text-lg">{formatUSD(costBreakdown.total)}</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700">
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
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRent}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Processing..." : `Rent for ${formatUSD(costBreakdown.total)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}