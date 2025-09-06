"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Shield } from "lucide-react";
import RentDomainPopup from "./RentDomainPopup";
import { ListingWithMeta } from "@/lib/rental/types";
import { formatUSD, formatDate, getDaysLeft } from "@/lib/rental/format";

interface ListingCardProps {
  listing: ListingWithMeta;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [showRentDialog, setShowRentDialog] = useState(false);

  const isRented = !!listing.rental;
  const isPaused = listing.listing.paused;
  const isAvailable = !isRented && !isPaused;

  const StatusPill = () => {
    if (isRented && listing.rental) {
      const daysLeft = getDaysLeft(listing.rental.expires);
      return (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800">
          Rented • {daysLeft}d left
        </span>
      );
    }
    if (isPaused) {
      return (
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-300 dark:ring-neutral-700">
          Paused
        </span>
      );
    }
    return (
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800">
        Available
      </span>
    );
  };

  const TldPill = () => (
    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
      {listing.tld}
    </span>
  );

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );

  return (
    <>
      <Card className="group rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
                  {listing.domain}
                  <span className="ml-1 font-semibold text-blue-700 dark:text-blue-300">
                    {listing.tld}
                  </span>
                </h3>
                {listing.verified && (
                  <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <TldPill />
                <StatusPill />
              </div>
            </div>
          </div>

          {/* Pricing / terms */}
          <div className="space-y-2.5">
            <Row
              label="Price per day"
              value={
                <span className="inline-flex items-center gap-1 font-semibold">
                  {formatUSD(listing.listing.pricePerDay)}
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={14}
                    height={14}
                    className="rounded-full"
                  />
                </span>
              }
            />
            <Row
              label="Security deposit"
              value={
                <span className="inline-flex items-center gap-1">
                  {formatUSD(listing.listing.securityDeposit)}
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={12}
                    height={12}
                    className="rounded-full"
                  />
                </span>
              }
            />
            <Row
              label="Rental period"
              value={`${listing.listing.minDays}-${listing.listing.maxDays} days`}
            />
          </div>

          {/* Domain expiry + Chain */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-[12.5px] text-neutral-600 dark:text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Domain expires{" "}
                {listing.expiresAt ? formatDate(listing.expiresAt) : "Unknown"}
              </span>
            </div>

            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-neutral-600 dark:text-neutral-400">Chain</span>
              <Image
                src="/images/logo/domaLogo.svg"
                alt="Doma"
                width={46}
                height={16}
                className="opacity-90"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 sm:p-5">
          <Button
            onClick={() => setShowRentDialog(true)}
            disabled={!isAvailable}
            className={`h-9 w-full rounded-lg text-[13px] ${
              isAvailable
                ? "bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
            variant={isAvailable ? "default" : "secondary"}
          >
            {isRented ? "Currently Rented" : isPaused ? "Paused" : "Rent Domain"}
          </Button>
        </CardFooter>
      </Card>

      {showRentDialog && isAvailable && (
        <RentDomainPopup
          listing={listing}
          open={showRentDialog}
          onOpenChange={setShowRentDialog}
        />
      )}
    </>
  );
}
