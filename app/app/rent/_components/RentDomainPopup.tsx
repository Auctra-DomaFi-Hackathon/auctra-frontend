"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useAtom } from "jotai";
import { rentDialogAtom, closeRentDialogAtom } from "@/atoms/rentals";
import { useRentDomain, RentalCostBreakdown } from "@/hooks/useRentDomain";
import { useRentalStatus, formatAddress, formatTimeLeft } from "@/hooks/useRentalStatus";
import { Info, BadgeInfo, Clock, CheckCircle2, Loader2, ExternalLink, AlertCircle, Wallet } from "lucide-react";

export default function RentDomainPopup() {
  const [rentDialogState] = useAtom(rentDialogAtom);
  const [, closeRentDialog] = useAtom(closeRentDialogAtom);
  const { open, listing } = rentDialogState;

  const [days, setDays] = useState<number | string>(listing?.listing?.minDays || 1);
  const [costBreakdown, setCostBreakdown] = useState<RentalCostBreakdown | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const { address } = useAccount();
  const { toast } = useToast();
  const rentalStatus = useRentalStatus(listing?.id || null);

  const {
    calculateRentalCost,
    formatUSDC,
    usdcBalance,
    usdcAllowance,
    hasSufficientBalance,
    hasSufficientAllowance,
    currentAction,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
    approveUSDC,
    rentDomain,
    resetAction,
  } = useRentDomain();

  useEffect(() => {
    if (listing) setDays(listing.listing.minDays);
  }, [listing]);

  useEffect(() => {
    if (!listing) return;
    // Don't calculate cost if days is empty string
    if (days === "" || typeof days === "string") return;
    
    const run = async () => {
      const b = await calculateRentalCost(listing.listing.pricePerDay, listing.listing.securityDeposit, days);
      setCostBreakdown(b);
    };
    run();
  }, [days, listing, calculateRentalCost]);

  useEffect(() => {
    if (!listing) return;
    if (isConfirmed && currentAction === "approve-usdc") {
      setCurrentStep(2);
      toast({ title: "USDC Approved", description: "You can continue to rent." });
    } else if (isConfirmed && currentAction === "rent") {
      const shortHash = hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : "";
      const link = hash ? `https://explorer-testnet.doma.xyz/tx/${hash}` : "";
      toast({
        title: "Domain Rented",
        description: (
          <div className="space-y-1.5">
            <p>{listing.domain}{listing.tld} for {typeof days === "string" ? parseInt(days) || 1 : days} days</p>
            {!!shortHash && <p className="text-xs text-muted-foreground">Tx: {shortHash}</p>}
            {!!link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                View Transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ),
        duration: 12000,
      });
      closeRentDialog();
    }
  }, [isConfirmed, currentAction, listing, days, hash, toast, closeRentDialog]);

  useEffect(() => {
    if (!error) return;
    const msg = error instanceof Error ? error.message : String(error);
    toast({ title: "Transaction Failed", description: msg, variant: "destructive" });
    resetAction();
  }, [error, toast, resetAction]);

  const handleApproveUSDC = useCallback(async () => {
    if (!costBreakdown) return;
    await approveUSDC(costBreakdown.totalPayment);
  }, [approveUSDC, costBreakdown]);

  const handleRentDomain = useCallback(async () => {
    if (!listing) return;
    const numDays = typeof days === "string" ? parseInt(days) : days;
    if (isNaN(numDays)) return;
    await rentDomain(listing.id, numDays);
  }, [rentDomain, listing, days]);

  const handleDaysChange = (v: string) => {
    // Allow empty string for user to clear and retype
    if (v === "") {
      setDays("");
      return;
    }
    
    const n = parseInt(v);
    if (!Number.isNaN(n) && n > 0) {
      setDays(n);
    }
  };

  const handleDaysBlur = (v: string) => {
    const n = parseInt(v);
    if (Number.isNaN(n) || v === "") {
      // If empty or invalid, set to minimum days
      setDays(listing!.listing.minDays);
      return;
    }
    const clamped = Math.max(listing!.listing.minDays, Math.min(listing!.listing.maxDays, n));
    setDays(clamped);
  };

  const handleClose = () => {
    resetAction();
    setCurrentStep(1);
    closeRentDialog();
  };

  if (!listing) return null;

  if (!address) {
    return (
      <Dialog open={open} onOpenChange={() => closeRentDialog()}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden backdrop-blur-xl border border-border/70">
          <div className="p-5">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                Wallet Required
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Please connect your wallet to continue.</p>
            <div className="mt-4">
              <Button onClick={() => closeRentDialog()} className="w-full h-9">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show rented status if domain is already rented
  if (rentalStatus.status === 'RENTED' || rentalStatus.status === 'EXPIRED') {
    return (
      <Dialog open={open} onOpenChange={() => closeRentDialog()}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden backdrop-blur-xl border border-border/70">
          <div className="p-5">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                {listing.domain}{listing.tld} Status
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800">
                  {rentalStatus.status === 'RENTED' ? 'Currently Rented' : 'Rental Expired'}
                </div>
              </div>
              
              {rentalStatus.renter && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Rented by</span>
                    <span className="font-medium font-mono">{formatAddress(rentalStatus.renter)}</span>
                  </div>
                  {rentalStatus.expiresAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {rentalStatus.status === 'RENTED' ? 'Expires' : 'Expired'}
                      </span>
                      <span className="font-medium">{rentalStatus.expiresAt.toLocaleDateString()}</span>
                    </div>
                  )}
                  {rentalStatus.timeLeft && rentalStatus.timeLeft > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Time left</span>
                      <span className="font-medium">{formatTimeLeft(rentalStatus.timeLeft)}</span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {rentalStatus.status === 'RENTED' 
                  ? 'This domain is currently rented and unavailable.' 
                  : 'This domain rental has expired and can be ended by anyone.'}
              </p>
            </div>
            <div className="mt-4">
              <Button onClick={() => closeRentDialog()} className="w-full h-9">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!costBreakdown) {
    return (
      <Dialog open={open} onOpenChange={() => closeRentDialog()}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden backdrop-blur-xl border border-border/70">
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const hasEnoughBalance = typeof usdcBalance === "bigint" ? hasSufficientBalance(costBreakdown.totalPayment) : false;
  const hasEnoughAllowance = typeof usdcAllowance === "bigint" ? hasSufficientAllowance(costBreakdown.totalPayment) : false;
  const canStep2 = currentStep === 2 || hasEnoughAllowance;
  const busy = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 overflow-hidden backdrop-blur-xl border border-border/70">
        <div className="p-5 pb-3">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              Rent {listing.domain}{listing.tld}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 text-xs">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${currentStep >= 1 ? "bg-blue-50 text-blue-700 ring-blue-200" : "text-muted-foreground ring-border"}`}>
              {currentStep > 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-4 w-4 grid place-items-center text-[11px]">1</span>}
              Approve
            </div>
            <span className="h-px w-6 bg-border" />
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${currentStep >= 2 ? "bg-blue-50 text-blue-700 ring-blue-200" : "text-muted-foreground ring-border"}`}>
              <span className="h-4 w-4 grid place-items-center text-[11px]">2</span>
              Rent
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="days" className="text-xs">Rental Period (days)</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => handleDaysChange(e.target.value)}
                onBlur={(e) => handleDaysBlur(e.target.value)}
                min={listing.listing.minDays}
                max={listing.listing.maxDays}
                disabled={busy}
                className="mt-1 h-9 text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Min {listing.listing.minDays} • Max {listing.listing.maxDays}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg ring-1 ring-border p-2.5">
                <div className="text-muted-foreground">Balance</div>
                <div className="mt-1 text-sm font-medium">{formatUSDC(typeof usdcBalance === "bigint" ? usdcBalance : BigInt(0))}</div>
              </div>
              <div className="rounded-lg ring-1 ring-border p-2.5">
                <div className="text-muted-foreground">Allowance</div>
                <div className="mt-1 text-sm font-medium">{formatUSDC(typeof usdcAllowance === "bigint" ? usdcAllowance : BigInt(0))}</div>
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-border p-3">
              <div className="flex items-center gap-2 text-[13px] font-medium mb-2"><BadgeInfo className="h-4 w-4" /> Cost</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Rental ({typeof days === "string" ? parseInt(days) || 1 : days} × {formatUSDC(listing.listing.pricePerDay)})</span><span>{formatUSDC(costBreakdown.rentalFee)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Protocol fee</span><span>{formatUSDC(costBreakdown.protocolFee)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Deposit (refundable)</span><span>{formatUSDC(costBreakdown.securityDeposit)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between text-[15px] font-semibold"><span>Total</span><span>{formatUSDC(costBreakdown.totalPayment)}</span></div>
              </div>
            </div>

            {!hasEnoughBalance && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Insufficient USDC. Need {formatUSDC(costBreakdown.totalPayment)}.
                </AlertDescription>
              </Alert>
            )}

            {hash && (
              <div className="rounded-lg ring-1 ring-blue-200 bg-blue-50/60 p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-700">{isConfirming ? "Confirming…" : "Transaction Sent"}</span>
                  <a href={`https://explorer-testnet.doma.xyz/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1">
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t p-3 flex gap-2">
          <Button variant="outline" className="flex-1 h-9" onClick={handleClose} disabled={busy}>
            Cancel
          </Button>

          {currentStep === 1 ? (
            <Button className="flex-1 h-9" onClick={handleApproveUSDC} disabled={busy || !hasEnoughBalance}>
              {busy && currentAction === "approve-usdc" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {busy && currentAction === "approve-usdc" ? "Approving…" : `Approve ${formatUSDC(costBreakdown.totalPayment)}`}
            </Button>
          ) : (
            <Button className="flex-1 h-9 bg-green-600 hover:bg-green-700" onClick={handleRentDomain} disabled={busy || !canStep2}>
              {busy && currentAction === "rent" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
              {busy && currentAction === "rent" ? "Renting…" : `Rent ${typeof days === "string" ? parseInt(days) || 1 : days}d`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
