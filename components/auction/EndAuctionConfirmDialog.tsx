"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface EndAuctionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  domain: string;
  tld: string;
  isLoading?: boolean;
}

export default function EndAuctionConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  domain,
  tld,
  isLoading = false,
}: EndAuctionConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Confirm End Auction
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-gray-600 mb-4">
          Are you sure you want to end the auction for{" "}
          <span className="font-semibold text-blue-600">
            {domain}{tld}
          </span>
          ?
          <br />
          <br />
          This action cannot be undone. If there are bids, the highest bidder will win the auction.
        </DialogDescription>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Ending..." : "End Auction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}