"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Calendar } from "lucide-react";
import { ListingWithMeta } from "@/lib/rental/types";
import { formatUSD, formatDate, formatTimeLeft, getDaysLeft } from "@/lib/rental/format";
import { useState } from "react";
import RentDialog from "./RentDialog";

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
        <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Rented ({daysLeft}d left)
        </Badge>
      );
    }
    
    if (isPaused) {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          Paused
        </Badge>
      );
    }

    return (
      <Badge 
        variant="secondary" 
        className="bg-blue-50 text-blue-700 border-blue-200"
      >
        Available
      </Badge>
    );
  };

  const getTldBadge = () => {
    const colors = {
      ".com": "bg-green-50 text-green-700 border-green-200",
      ".io": "bg-purple-50 text-purple-700 border-purple-200",
      ".xyz": "bg-orange-50 text-orange-700 border-orange-200",
      ".org": "bg-blue-50 text-blue-700 border-blue-200",
      ".net": "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    const colorClass = colors[listing.tld as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200";

    return (
      <Badge variant="outline" className={colorClass}>
        {listing.tld}
      </Badge>
    );
  };

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200 hover:bg-blue-50/30">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {listing.domain}
                </h3>
                {listing.verified && (
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
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
              <span className="text-sm text-gray-600">Price per day</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatUSD(listing.listing.pricePerDay)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Security deposit</span>
              <span className="text-sm font-medium text-gray-900">
                {formatUSD(listing.listing.securityDeposit)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rental period</span>
              <span className="text-sm font-medium text-gray-900">
                {listing.listing.minDays}-{listing.listing.maxDays} days
              </span>
            </div>
          </div>

          {/* Domain Expiry */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Domain expires {formatDate(listing.expiresAt)}</span>
          </div>

          {/* Payment Token */}
          <div className="text-xs text-gray-500">
            Payment in USDC
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
            {isRented ? "Currently Rented" : isPaused ? "Paused" : "Rent Domain"}
          </Button>
        </CardFooter>
      </Card>

      {showRentDialog && isAvailable && (
        <RentDialog
          listing={listing}
          open={showRentDialog}
          onOpenChange={setShowRentDialog}
        />
      )}
    </>
  );
}