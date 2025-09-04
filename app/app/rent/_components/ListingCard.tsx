"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Calendar } from "lucide-react";
import { ListingWithMeta } from "@/lib/rental/types";
import {
  formatUSD,
  formatDate,
  formatTimeLeft,
  getDaysLeft,
} from "@/lib/rental/format";
import { useState } from "react";
import RentDomainPopup from "./RentDomainPopup";
import Image from "next/image";

interface ListingCardProps {
  listing: ListingWithMeta;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [showRentDialog, setShowRentDialog] = useState(false);

  const isRented = !!listing.rental;
  const isPaused = listing.listing.paused;
  const isAvailable = !isRented && !isPaused;

  const getStatusBadge = () => {
    if (isRented && listing.rental) {
      const daysLeft = getDaysLeft(listing.rental.expires);
      return (
        <Badge
          variant="default"
          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
        >
          <Clock className="w-3 h-3 mr-1" />
          Rented ({daysLeft}d left)
        </Badge>
      );
    }

    if (isPaused) {
      return (
        <Badge
          variant="outline"
          className="text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-600"
        >
          Paused
        </Badge>
      );
    }

    return (
      <Badge
        variant="secondary"
        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      >
        Available
      </Badge>
    );
  };

  const getTldBadge = () => {
    const colors = {
      ".com":
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      ".io":
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      ".xyz":
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      ".org":
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      ".net":
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
    };

    const colorClass =
      colors[listing.tld as keyof typeof colors] ||
      "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600";

    return (
      <Badge variant="outline" className={colorClass}>
        {listing.tld}
      </Badge>
    );
  };

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200 hover:bg-blue-50/30 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-white">
                  {listing.domain}
                </h3>
                {listing.verified && (
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 dark:text-blue-400" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {getTldBadge()}
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Price per day
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatUSD(listing.listing.pricePerDay)}
                <Image
                  src="/images/LogoCoin/usd-coin-usdc-logo.png"
                  alt="USDC"
                  width={18}
                  height={12}
                  className="rounded-full inline-block ml-1.5 mb-1"
                />
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Security deposit
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatUSD(listing.listing.securityDeposit)}
                <Image
                  src="/images/LogoCoin/usd-coin-usdc-logo.png"
                  alt="USDC"
                  width={15}
                  height={12}
                  className="rounded-full inline-block ml-1.5 mb-1"
                />
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Rental period
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {listing.listing.minDays}-{listing.listing.maxDays} days
              </span>
            </div>
          </div>

          {/* Domain Expiry */}
          <div className="flex items-center text-sm text-gray-500 mb-4 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Domain expires {formatDate(listing.expiresAt)}</span>
          </div>

          {/* Payment Token */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-1 text-sm text-gray-600 dark:text-gray-400">
              Chain
            </span>
            <span>
              <Image
                src="/images/logo/domaLogo.svg"
                alt="USDC"
                width={50}
                height={12}
                className="rounded-full inline-block ml-1"
              />
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            onClick={() => setShowRentDialog(true)}
            disabled={!isAvailable}
            className={`w-full ${
              isAvailable
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
            }`}
            variant={isAvailable ? "default" : "secondary"}
          >
            {isRented
              ? "Currently Rented"
              : isPaused
              ? "Paused"
              : "Rent Domain"}
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
