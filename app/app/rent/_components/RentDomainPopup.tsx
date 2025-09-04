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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from "react";
import { ListingWithMeta } from "@/lib/rental/types";
import { formatUSD } from "@/lib/rental/format";
import { useRentDomain, RentalCostBreakdown } from "@/hooks/useRentDomain";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Shield, Clock, CheckCircle, Loader2, ExternalLink, AlertCircle, Wallet } from "lucide-react";
import { useAccount } from "wagmi";

interface RentDomainPopupProps {
  listing: ListingWithMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RentDomainPopup({ listing, open, onOpenChange }: RentDomainPopupProps) {
  const [days, setDays] = useState(listing.listing.minDays);
  const [costBreakdown, setCostBreakdown] = useState<RentalCostBreakdown | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // Step 1: Approve USDC, Step 2: Rent Domain
  
  const { address } = useAccount();
  const { toast } = useToast();
  
  const {
    // Cost calculation
    calculateRentalCost,
    formatUSDC,
    
    // Balance & Allowance
    usdcBalance,
    usdcAllowance,
    hasSufficientBalance,
    hasSufficientAllowance,
    
    // Transaction state
    currentAction,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
    
    // Write functions
    approveUSDC,
    rentDomain,
    
    // Utility
    resetAction,
  } = useRentDomain();

  // Calculate costs when days change
  useEffect(() => {
    const calculateCosts = async () => {
      try {
        const breakdown = await calculateRentalCost(
          listing.listing.pricePerDay,
          listing.listing.securityDeposit,
          days
        );
        setCostBreakdown(breakdown);
      } catch (error) {
        console.error('Failed to calculate rental costs:', error);
      }
    };

    calculateCosts();
  }, [days, listing.listing.pricePerDay, listing.listing.securityDeposit, calculateRentalCost]);

  // Handle transaction confirmations
  useEffect(() => {
    if (isConfirmed && currentAction === 'approve-usdc') {
      setCurrentStep(2);
      toast({
        title: 'USDC Approved!',
        description: 'You can now proceed to rent the domain.',
      });
    } else if (isConfirmed && currentAction === 'rent') {
      const shortHash = hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : '';
      const explorerUrl = hash ? `https://explorer-testnet.doma.xyz/tx/${hash}` : '';
      
      toast({
        title: '🎉 Domain Rented Successfully!',
        description: (
          <div className="space-y-2">
            <p>{listing.domain}{listing.tld} is yours for {days} days!</p>
            <p>Transaction: {shortHash}</p>
            {explorerUrl && (
              <a 
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm font-medium"
              >
                View Transaction <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ),
        duration: 15000, // Extended duration so user can click the link
      });
      onOpenChange(false);
      // Remove the page reload - let user manually refresh if needed
    }
  }, [isConfirmed, currentAction, listing.domain, listing.tld, days, hash, toast, onOpenChange]);

  // Handle errors
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Transaction Failed',
        description: errorMessage || 'An unknown error occurred',
        variant: 'destructive',
      });
      // Clear the error after showing toast to prevent rendering issues
      resetAction();
    }
  }, [error, toast, resetAction]);

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

  const handleApproveUSDC = useCallback(async () => {
    if (!costBreakdown) return;
    
    try {
      await approveUSDC(costBreakdown.totalPayment);
    } catch (error) {
      console.error('Failed to approve USDC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve USDC';
      toast({
        title: 'Approval Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [approveUSDC, costBreakdown, toast]);

  const handleRentDomain = useCallback(async () => {
    try {
      await rentDomain(listing.id, days);
    } catch (error) {
      console.error('Failed to rent domain:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to rent domain';
      toast({
        title: 'Rental Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [rentDomain, listing.id, days, toast]);

  const handleClose = () => {
    resetAction();
    setCurrentStep(1);
    onOpenChange(false);
  };

  if (!address) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Wallet Required
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400">
              Please connect your wallet to rent this domain.
            </p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!costBreakdown) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Loading...
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Safety check: if there's an error, don't render the main component
  if (error && !isConfirmed) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600 dark:text-red-400">
              Error
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
          <Button onClick={handleClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const hasEnoughBalance = costBreakdown && typeof usdcBalance === 'bigint' ? hasSufficientBalance(costBreakdown.totalPayment) : false;
  const hasEnoughAllowance = costBreakdown && typeof usdcAllowance === 'bigint' ? hasSufficientAllowance(costBreakdown.totalPayment) : false;
  const canProceedToStep2 = currentStep === 2 || hasEnoughAllowance;
  const isTransacting = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Rent {listing.domain}{listing.tld}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                currentStep >= 1 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }`}>
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-medium">Approve USDC</span>
            </div>
            <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                currentStep >= 2 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }`}>
                2
              </div>
              <span className="font-medium">Rent Domain</span>
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <Label htmlFor="days" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                disabled={isTransacting}
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Min: {listing.listing.minDays} days, Max: {listing.listing.maxDays} days
              </p>
            </div>
          </div>

          {/* Balance Information */}
          <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your USDC Balance</span>
              <span className="font-medium dark:text-white">{formatUSDC(typeof usdcBalance === 'bigint' ? usdcBalance : BigInt(0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">USDC Allowance</span>
              <span className="font-medium dark:text-white">{formatUSDC(typeof usdcAllowance === 'bigint' ? usdcAllowance : BigInt(0))}</span>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
            <h4 className="font-medium text-gray-900 mb-3 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Cost Breakdown
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Rental fee ({days} × {formatUSDC(listing.listing.pricePerDay)}/day)
                </span>
                <span className="font-medium dark:text-white">{formatUSDC(costBreakdown.rentalFee)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Protocol fee</span>
                <span className="font-medium dark:text-white">{formatUSDC(costBreakdown.protocolFee)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Security deposit (refundable)</span>
                <span className="font-medium dark:text-white">{formatUSDC(costBreakdown.securityDeposit)}</span>
              </div>

              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Owner receives</span>
                <span className="font-medium">{formatUSDC(costBreakdown.ownerReceives)}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-semibold">
                <span className="dark:text-white">Total Payment</span>
                <span className="text-lg dark:text-white">{formatUSDC(costBreakdown.totalPayment)}</span>
              </div>
            </div>
          </div>

          {/* Balance Warning */}
          {!hasEnoughBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient USDC balance. You need {formatUSDC(costBreakdown.totalPayment)} but only have {formatUSDC(typeof usdcBalance === 'bigint' ? usdcBalance : BigInt(0))}.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Transaction Info */}
          {hash && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 dark:text-blue-400 font-medium">
                  {isConfirming ? 'Confirming...' : 'Transaction Sent'}
                </span>
                <a 
                  href={`https://explorer-testnet.doma.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isTransacting}
            >
              Cancel
            </Button>
            
            {currentStep === 1 ? (
              <Button
                onClick={handleApproveUSDC}
                disabled={isTransacting || !hasEnoughBalance}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isTransacting && currentAction === 'approve-usdc' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isPending ? 'Approving...' : 'Confirming...'}
                  </>
                ) : (
                  `Approve ${formatUSDC(costBreakdown.totalPayment)}`
                )}
              </Button>
            ) : (
              <Button
                onClick={handleRentDomain}
                disabled={isTransacting || !canProceedToStep2}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isTransacting && currentAction === 'rent' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isPending ? 'Renting...' : 'Confirming...'}
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Rent for {days} days
                  </>
                )}
              </Button>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}