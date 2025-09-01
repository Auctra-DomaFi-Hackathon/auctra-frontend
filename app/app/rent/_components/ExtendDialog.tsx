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
import { formatUSD, formatDate, getDaysLeft } from "@/lib/rental/format";
import { calculateRentCost } from "@/lib/rental/mockService";
import { useManageRentals } from "@/lib/rental/hooks";
import { useToast } from "@/hooks/use-toast";

interface ExtendDialogProps {
  listingId: number;
  listing: ListingWithMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ExtendDialog({ 
  listingId, 
  listing, 
  open, 
  onOpenChange, 
  onSuccess 
}: ExtendDialogProps) {
  const [extraDays, setExtraDays] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { actions } = useManageRentals();
  const { toast } = useToast();

  if (!listing.rental) {
    return null;
  }

  const currentDaysLeft = getDaysLeft(listing.rental.expires);
  const newExpiryDate = new Date((listing.rental.expires + (extraDays * 24 * 60 * 60)) * 1000);
  
  // Calculate extend cost (just the extra days, no deposit since it's already locked)
  const extendCost = calculateRentCost(listing.listing.pricePerDay, extraDays, 0n);

  const handleExtend = async () => {
    if (extraDays < 1) {
      toast({
        title: "Error",
        description: "Extra days must be at least 1",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await actions.extend(listingId, extraDays);
      toast({
        title: "Success!",
        description: `Rental extended by ${extraDays} days`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extend rental",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Extend Rental - {listing.domain}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Rental</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Current expiry: {formatDate(listing.rental.expires)}</div>
              <div>Days remaining: {currentDaysLeft}</div>
            </div>
          </div>

          {/* Extension Input */}
          <div>
            <Label htmlFor="extra-days" className="text-sm font-medium text-gray-700">
              Extra Days
            </Label>
            <div className="mt-2">
              <Input
                id="extra-days"
                type="number"
                min="1"
                value={extraDays}
                onChange={(e) => setExtraDays(parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
          </div>

          {/* New Status Preview */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">After Extension</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>New expiry: {newExpiryDate.toLocaleDateString()}</div>
              <div>Total days: {currentDaysLeft + extraDays}</div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Extension Cost</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Extra days ({extraDays} × {formatUSD(listing.listing.pricePerDay)}/day)
                </span>
                <span className="font-medium">{formatUSD(extendCost.basePrice)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Protocol fee (2%)</span>
                <span className="font-medium">{formatUSD(extendCost.protocolFee)}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-semibold">
                <span>Total Cost</span>
                <span className="text-lg">{formatUSD(extendCost.total)}</span>
              </div>
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
              onClick={handleExtend}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Extending..." : `Extend for ${formatUSD(extendCost.total)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}