"use client";

import React from "react";
import { useAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { endAuctionSuccessAtom, closeEndAuctionSuccessAtom } from "@/atoms/transactions";

export default function EndAuctionSuccessDialog() {
  const [successState] = useAtom(endAuctionSuccessAtom);
  const [, closeSuccess] = useAtom(closeEndAuctionSuccessAtom);

  if (!successState.open || !successState.hash || !successState.domain) {
    return null;
  }
  const explorerUrl = `https://explorer-testnet.doma.xyz/tx/${successState.hash}`;

  return (
    <Dialog open={successState.open} onOpenChange={() => closeSuccess()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">
            Auction Ended Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              The auction for <span className="font-semibold text-gray-900 dark:text-white">{successState.domain}</span> has been ended successfully.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Hash:</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto"
                onClick={() => window.open(explorerUrl, '_blank')}
              >
                <span className="mr-1">
                  {successState.hash.slice(0, 6)}...{successState.hash.slice(-4)}
                </span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(explorerUrl, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Transaction
            </Button>
            <Button
              onClick={() => closeSuccess()}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}