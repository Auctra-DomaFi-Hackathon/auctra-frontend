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
import { useState, useEffect } from "react";
import { ListingWithMeta } from "@/lib/rental/types";
import { formatUSDC, parseUSDCInput } from "@/lib/rental/format";
import { useManageRentals } from "@/lib/rental/hooks";
import { MOCK_ACCOUNTS } from "@/lib/rental/mockService";
import { useToast } from "@/hooks/use-toast";

interface EditTermsDialogProps {
  listingId: number;
  listing: ListingWithMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditTermsDialog({ 
  listingId, 
  listing, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditTermsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [pricePerDay, setPricePerDay] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [minDays, setMinDays] = useState("");
  const [maxDays, setMaxDays] = useState("");

  const { actions } = useManageRentals();
  const { toast } = useToast();

  useEffect(() => {
    if (listing) {
      setPricePerDay(formatUSDC(listing.listing.pricePerDay));
      setSecurityDeposit(formatUSDC(listing.listing.securityDeposit));
      setMinDays(listing.listing.minDays.toString());
      setMaxDays(listing.listing.maxDays.toString());
    }
  }, [listing]);

  const handleSave = async () => {
    if (!pricePerDay || !securityDeposit || !minDays || !maxDays) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const minDaysNum = parseInt(minDays);
    const maxDaysNum = parseInt(maxDays);

    if (minDaysNum < 1 || maxDaysNum < minDaysNum) {
      toast({
        title: "Error",
        description: "Please enter valid day ranges",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await actions.setTerms(
        listingId,
        parseUSDCInput(pricePerDay),
        parseUSDCInput(securityDeposit),
        minDaysNum,
        maxDaysNum,
        MOCK_ACCOUNTS.usdc
      );
      
      toast({
        title: "Success!",
        description: "Terms updated successfully",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update terms",
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
            Edit Terms - {listing?.domain}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price-per-day" className="text-sm font-medium text-gray-700">
                Price per Day (USD)
              </Label>
              <Input
                id="price-per-day"
                type="number"
                step="0.01"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="security-deposit" className="text-sm font-medium text-gray-700">
                Security Deposit (USD)
              </Label>
              <Input
                id="security-deposit"
                type="number"
                step="0.01"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-days" className="text-sm font-medium text-gray-700">
                Minimum Days
              </Label>
              <Input
                id="min-days"
                type="number"
                min="1"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="max-days" className="text-sm font-medium text-gray-700">
                Maximum Days
              </Label>
              <Input
                id="max-days"
                type="number"
                min="1"
                value={maxDays}
                onChange={(e) => setMaxDays(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

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
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Updating..." : "Update Terms"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}