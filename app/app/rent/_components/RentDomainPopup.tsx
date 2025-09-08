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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useAtom } from "jotai";
import { rentDialogAtom, closeRentDialogAtom } from "@/atoms/rentals";
import { useRentDomain, RentalCostBreakdown } from "@/hooks/useRentDomain";
import {
  useRentalStatus,
  formatAddress,
  formatTimeLeft,
} from "@/hooks/useRentalStatus";
import {
  Info,
  BadgeInfo,
  Clock,
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertCircle,
  Wallet,
} from "lucide-react";
import Image from "next/image";

// Format USDC to integer string for badges
const formatUSDCInteger = (amount: bigint): string => {
  const formatted = Number(amount) / 1_000_000;
  return Math.floor(formatted).toLocaleString("en-US");
};

/** ---------- Fixed: Panel diletakkan di top-level agar tidak remount (fokus input aman) ---------- */
const Panel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <div
    className={[
      // Light surface
      "bg-white shadow-xl border border-slate-200",
      // Dark surface (glassy)
      "dark:bg-[#0b1220]/95 dark:border-white/10 dark:shadow-black/60 supports-[backdrop-filter]:backdrop-blur-xl",
      "rounded-2xl p-0 overflow-hidden",
      className || "",
    ].join(" ")}
  >
    {children}
  </div>
);
/** ---------------------------------------------------------------------------------------------- */

export default function RentDomainPopup() {
  const [rentDialogState] = useAtom(rentDialogAtom);
  const [, closeRentDialog] = useAtom(closeRentDialogAtom);
  const { open, listing } = rentDialogState;

  const [days, setDays] = useState<number | string>(
    listing?.listing?.minDays || 1
  );
  const [costBreakdown, setCostBreakdown] =
    useState<RentalCostBreakdown | null>(null);
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

  // Set initial days saat listing berubah (tidak mengganggu saat user sedang mengosongkan input)
  useEffect(() => {
    if (listing && days === "") {
      setDays(listing.listing.minDays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id]);

  // Hitung biaya (debounce) — jangan paksa saat user masih mengetik kosong
  useEffect(() => {
    if (!listing) return;
    const numDays = typeof days === "string" ? parseInt(days) : days;
    if (days === "" || isNaN(numDays) || numDays <= 0) return;

    const t = setTimeout(async () => {
      const b = await calculateRentalCost(
        listing.listing.pricePerDay,
        listing.listing.securityDeposit,
        numDays
      );
      setCostBreakdown(b);
    }, 250);
    return () => clearTimeout(t);
  }, [days, listing, calculateRentalCost]);

  // Toast & stepper transitions
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
            <p>
              {listing.domain}
              {listing.tld} for {typeof days === "string" ? parseInt(days) || 1 : days} days
            </p>
            {!!shortHash && <p className="text-xs text-muted-foreground">Tx: {shortHash}</p>}
            {!!link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-300 text-xs"
              >
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

  // Error toast
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

  /** --------- Input handlers (jaga fokus & multi-digit typing) --------- */
  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) setDays(value);
  };

  const handleDaysBlur = (v: string) => {
    if (!listing) return;
    if (v === "") {
      setDays(listing.listing.minDays);
      return;
    }
    const n = parseInt(v);
    if (Number.isNaN(n) || n < listing.listing.minDays) {
      setDays(listing.listing.minDays);
      return;
    }
    if (n > listing.listing.maxDays) {
      setDays(listing.listing.maxDays);
      return;
    }
    setDays(n);
  };
  /** ------------------------------------------------------------------- */

  const handleClose = () => {
    resetAction();
    setCurrentStep(1);
    closeRentDialog();
  };

  if (!listing) return null;

  // Not connected
  if (!address) {
    return (
      <Dialog open={open} onOpenChange={() => closeRentDialog()}>
        <DialogContent className="sm:max-w-[420px] border-0 bg-transparent p-0">
          <Panel>
            <div className="p-5">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-[15px] font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Wallet className="h-4 w-4 text-sky-600 dark:text-sky-500" />
                  Wallet Required
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Please connect your wallet to continue.
              </p>
              <div className="mt-4">
                <Button onClick={() => closeRentDialog()} className="w-full h-9">
                  Close
                </Button>
              </div>
            </div>
          </Panel>
        </DialogContent>
      </Dialog>
    );
  }

  // Rented / Expired
  if (rentalStatus.status === "RENTED" || rentalStatus.status === "EXPIRED") {
    return (
      <Dialog open={open} onOpenChange={() => closeRentDialog()}>
        <DialogContent className="sm:max-w-[420px] border-0 bg-transparent p-0">
          <Panel>
            <div className="p-5">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-[15px] font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Info className="h-4 w-4 text-amber-600" />
                  {listing.domain}
                  {listing.tld} Status
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-800/60">
                    {rentalStatus.status === "RENTED" ? "Currently Rented" : "Rental Expired"}
                  </div>
                </div>

                {rentalStatus.renter && (
                  <div className="rounded-lg p-3 space-y-2 ring-1 ring-slate-200 bg-slate-50 dark:ring-white/10 dark:bg-white/[0.04]">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Rented by</span>
                      <span className="font-medium font-mono text-slate-900 dark:text-slate-100">
                        {formatAddress(rentalStatus.renter)}
                      </span>
                    </div>
                    {rentalStatus.expiresAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          {rentalStatus.status === "RENTED" ? "Expires" : "Expired"}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {rentalStatus.expiresAt.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {rentalStatus.timeLeft && rentalStatus.timeLeft > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Time left</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatTimeLeft(rentalStatus.timeLeft)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  {rentalStatus.status === "RENTED"
                    ? "This domain is currently rented and unavailable."
                    : "This domain rental has expired and can be ended by anyone."}
                </p>
              </div>

              <div className="mt-4">
                <Button onClick={() => closeRentDialog()} className="w-full h-9">
                  Close
                </Button>
              </div>
            </div>
          </Panel>
        </DialogContent>
      </Dialog>
    );
  }

  if (!costBreakdown) {
    return (
      <Dialog open={open} onOpenChange={() => closeRentDialog()}>
        <DialogContent className="sm:max-w-[420px] border-0 bg-transparent p-0">
          <Panel>
            <div className="p-6 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-sky-600 dark:text-sky-500" />
            </div>
          </Panel>
        </DialogContent>
      </Dialog>
    );
  }

  const hasEnoughBalance =
    typeof usdcBalance === "bigint"
      ? hasSufficientBalance(costBreakdown.totalPayment)
      : false;
  const hasEnoughAllowance =
    typeof usdcAllowance === "bigint"
      ? hasSufficientAllowance(costBreakdown.totalPayment)
      : false;
  const canStep2 = currentStep === 2 || hasEnoughAllowance;
  const busy = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] border-0 bg-transparent p-0">
        <Panel>
          <div className="p-5 pb-3">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-[15px] font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Info className="h-4 w-4 text-sky-600 dark:text-sky-500" />
                Rent {listing.domain}
                {listing.tld}
              </DialogTitle>
            </DialogHeader>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-3 text-xs">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${
                  currentStep >= 1
                    ? "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/40"
                    : "text-slate-500 ring-slate-200 dark:text-slate-500 dark:ring-white/10"
                }`}
              >
                {currentStep > 1 ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-4 w-4 grid place-items-center text-[11px]">1</span>
                )}
                Approve
              </div>
              <span className="h-px w-6 bg-slate-200 dark:bg-white/10" />
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${
                  currentStep >= 2
                    ? "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/40"
                    : "text-slate-500 ring-slate-200 dark:text-slate-500 dark:ring-white/10"
                }`}
              >
                <span className="h-4 w-4 grid place-items-center text-[11px]">2</span>
                Rent
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Days */}
              <div>
                <Label htmlFor="days" className="text-xs text-slate-700 dark:text-slate-300">
                  Rental Period (days)
                </Label>
                <Input
                  id="days"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={days.toString()}
                  onChange={handleDaysChange}
                  onBlur={(e) => handleDaysBlur(e.target.value)}
                  min={listing.listing.minDays}
                  max={listing.listing.maxDays}
                  disabled={busy}
                  className="
                    mt-1 h-9 text-sm
                    bg-white border border-slate-300 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                    dark:bg-white/[0.04] dark:border-white/10 dark:placeholder-slate-500
                    dark:focus:ring-sky-400/20 dark:focus:border-sky-400
                    text-slate-900 dark:text-slate-100
                  "
                  placeholder={`Enter days (${listing.listing.minDays}-${listing.listing.maxDays})`}
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Min {listing.listing.minDays} • Max {listing.listing.maxDays}
                </p>
              </div>

              {/* Balance / Allowance */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl p-3 ring-1 ring-slate-200 bg-slate-50 dark:ring-white/10 dark:bg-white/[0.04]">
                  <div className="text-slate-600 dark:text-slate-400">Balance</div>
                  <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={16} height={16} />
                    {formatUSDCInteger(typeof usdcBalance === "bigint" ? usdcBalance : BigInt(0))}
                  </div>
                </div>
                <div className="rounded-xl p-3 ring-1 ring-slate-200 bg-slate-50 dark:ring-white/10 dark:bg-white/[0.04]">
                  <div className="text-slate-600 dark:text-slate-400">Allowance</div>
                  <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={16} height={16} />
                    {formatUSDCInteger(typeof usdcAllowance === "bigint" ? usdcAllowance : BigInt(0))}
                  </div>
                </div>
              </div>

              {/* Cost */}
              <div className="rounded-2xl p-4 ring-1 ring-slate-200 bg-slate-50 dark:ring-white/10 dark:bg-white/[0.04]">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-slate-900 dark:text-slate-100">
                  <BadgeInfo className="h-4 w-4 text-sky-600 dark:text-sky-400" /> Cost
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Rental ({typeof days === "string" ? parseInt(days) || 1 : days} ×{" "}
                      <span className="inline-flex items-center gap-1">
                        <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={12} height={12} />
                        {formatUSDC(listing.listing.pricePerDay)}
                      </span>
                      )
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
                      <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={14} height={14} />
                      {formatUSDC(costBreakdown.rentalFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Protocol fee</span>
                    <span className="text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
                      <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={14} height={14} />
                      {formatUSDC(costBreakdown.protocolFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Deposit (refundable)</span>
                    <span className="text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
                      <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={14} height={14} />
                      {formatUSDC(costBreakdown.securityDeposit)}
                    </span>
                  </div>
                  <Separator className="my-2 bg-slate-200 dark:bg-white/10" />
                  <div className="flex justify-between text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                    <span>Total</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={16} height={16} />
                      {formatUSDC(costBreakdown.totalPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {!hasEnoughBalance && (
                <Alert className="py-2.5 bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-200" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs inline-flex items-center gap-1.5">
                    Insufficient USDC. Need{" "}
                    <span className="inline-flex items-center gap-1">
                      <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={12} height={12} />
                      {formatUSDC(costBreakdown.totalPayment)}
                    </span>
                    .
                  </AlertDescription>
                </Alert>
              )}

              {hash && (
                <div className="rounded-lg p-2.5 text-xs ring-1 ring-sky-200 bg-sky-50 dark:ring-sky-500/30 dark:bg-sky-500/10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sky-700 dark:text-sky-300">
                      {isConfirming ? "Confirming…" : "Transaction Sent"}
                    </span>
                    <a
                      href={`https://explorer-testnet.doma.xyz/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-700 hover:underline dark:text-sky-300"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 left-0 right-0 p-3 flex gap-2 bg-white border-t border-slate-200 dark:bg-[#0b1220]/95 dark:border-white/5 supports-[backdrop-filter]:backdrop-blur-xl">
            <Button variant="outline" className="flex-1 h-9 text-neutral-600 dark:text-black" onClick={handleClose} disabled={busy}>
              Cancel
            </Button>

            {currentStep === 1 ? (
              <Button
                className="flex-1 h-9 bg-sky-600 hover:bg-sky-700 dark:hover:bg-sky-500 focus-visible:ring-2 focus-visible:ring-sky-400"
                onClick={handleApproveUSDC}
                disabled={busy || !hasEnoughBalance}
              >
                {busy && currentAction === "approve-usdc" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {busy && currentAction === "approve-usdc" ? (
                  "Approving…"
                ) : (
                  <span className="flex items-center gap-1.5">
                    Approve
                    <Image src="/images/LogoCoin/usd-coin-usdc-logo.png" alt="USDC" width={14} height={14} />
                    {formatUSDC(costBreakdown.totalPayment)}
                  </span>
                )}
              </Button>
            ) : (
              <Button
                className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
                onClick={handleRentDomain}
                disabled={busy || !canStep2}
              >
                {busy && currentAction === "rent" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                {busy && currentAction === "rent"
                  ? "Renting…"
                  : `Rent ${typeof days === "string" ? parseInt(days) || 1 : days}d`}
              </Button>
            )}
          </div>
        </Panel>
      </DialogContent>
    </Dialog>
  );
}
