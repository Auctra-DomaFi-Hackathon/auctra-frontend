"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, ExternalLink } from "lucide-react";
import { useUserRentalHistory } from "@/lib/graphql/hooks";
import { formatDate } from "@/lib/rental/format";
import { useAccount } from "wagmi";

export default function MyRentalsTable() {
  const { address } = useAccount();
  const {
    userRentalProfile,
    rentalHistory,
    depositRecords,
    loading,
    totalRentals,
  } = useUserRentalHistory(address, 50);

  // Calculate active rentals by counting unique domains with "Rented" as the latest event
  const calculateActiveRentals = () => {
    if (!rentalHistory.length) return 0;

    const domainEvents = new Map();

    // Group events by tokenId and find the latest event for each domain
    rentalHistory.forEach((rental) => {
      const currentEvent = domainEvents.get(rental.tokenId);
      if (
        !currentEvent ||
        parseInt(rental.timestamp) > parseInt(currentEvent.timestamp)
      ) {
        domainEvents.set(rental.tokenId, rental);
      }
    });

    // Count domains where the latest event is "rented"
    let activeCount = 0;
    domainEvents.forEach((rental) => {
      if (rental.eventType.toLowerCase() === "rented") {
        activeCount++;
      }
    });

    return activeCount;
  };

  const activeRentals = calculateActiveRentals();

  const formatPrice = (priceString: string) => {
    const price = BigInt(priceString);
    const dollars = Number(price) / 1_000_000; // Assuming USDC with 6 decimals
    return `$${dollars.toLocaleString()}`;
  };

  // Calculate total spent and total deposits from rental history details
  const calculateTotals = () => {
    if (!rentalHistory.length) return { totalSpent: 0, totalDeposits: 0 };

    let totalSpent = 0;
    let totalDeposits = 0;

    rentalHistory.forEach((rental) => {
      if (rental.data && typeof rental.data === "object") {
        // Extract totalPaid from data
        if (rental.data.totalPaid) {
          const paidAmount = Number(BigInt(rental.data.totalPaid)) / 1_000_000;
          totalSpent += paidAmount;
        }
        // Extract deposit from data
        if (rental.data.deposit) {
          const depositAmount = Number(BigInt(rental.data.deposit)) / 1_000_000;
          totalDeposits += depositAmount;
        }
      }
    });

    return { totalSpent, totalDeposits };
  };

  const { totalSpent, totalDeposits } = calculateTotals();

  const formatEventType = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "rented":
        return {
          text: "Rented",
          color:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        };
      case "extended":
        return {
          text: "Extended",
          color:
            "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        };
      case "ended":
        return {
          text: "Ended",
          color:
            "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
        };
      case "expired":
        return {
          text: "Expired",
          color:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        };
      default:
        return {
          text: eventType,
          color:
            "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
        };
    }
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">My Rentals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Connect your wallet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please connect your wallet to view your rental history.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (rentalHistory.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No rental history
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven&apos;t rented any domains yet. Start browsing available
            domains to rent.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* User Stats Card */}
      {userRentalProfile && (
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="dark:text-white">Rental Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-black dark:text-white">
                  {totalRentals}
                </div>
                <div className="text-sm text-black dark:text-white">
                  Total Rentals
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-black dark:text-white">
                  Total Spent
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black dark:text-white">
                  {activeRentals}
                </div>
                <div className="text-sm text-black dark:text-white">
                  Active Rentals
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black dark:text-white">
                  ${totalDeposits.toLocaleString()}
                </div>
                <div className="text-sm text-black dark:text-white">
                  Total Deposits
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rental History Table */}
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">
            Rental History ({totalRentals})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">Domain</TableHead>
                  <TableHead className="dark:text-gray-300">Event</TableHead>
                  <TableHead className="dark:text-gray-300">Owner</TableHead>
                  <TableHead className="dark:text-gray-300">Date</TableHead>
                  <TableHead className="dark:text-gray-300">Details</TableHead>
                  <TableHead className="dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentalHistory.map((rental) => {
                  const eventStyle = formatEventType(rental.eventType);
                  return (
                    <TableRow key={rental.id} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-white">
                        <div>
                          <div className="font-semibold">
                            {rental.metadata?.name ||
                              `Domain-${rental.tokenId.slice(-8)}`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            #{rental.tokenId.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={eventStyle.color}>
                          {eventStyle.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm dark:text-gray-300">
                        {rental.owner.slice(0, 6)}...{rental.owner.slice(-4)}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatDate(parseInt(rental.timestamp))}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        <div className="text-xs space-y-1">
                          {rental.data && typeof rental.data === "object" && (
                            <>
                              {rental.data.days && (
                                <div>Duration: {rental.data.days} days</div>
                              )}
                              {rental.data.totalPaid && (
                                <div>
                                  Paid: {formatPrice(rental.data.totalPaid)}
                                </div>
                              )}
                              {rental.data.deposit && (
                                <div>
                                  Deposit: {formatPrice(rental.data.deposit)}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(
                              `https://explorer-testnet.doma.xyz/tx/${
                                rental.id.split("-")[0]
                              }`,
                              "_blank"
                            );
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Records */}
      {depositRecords.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Security Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">
                      Listing ID
                    </TableHead>
                    <TableHead className="dark:text-gray-300">Amount</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">
                      Locked Date
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Claimed Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depositRecords.map((deposit) => (
                    <TableRow key={deposit.id} className="dark:border-gray-700">
                      <TableCell className="font-mono text-sm dark:text-white">
                        #{deposit.listingId}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatPrice(deposit.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            deposit.claimed
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                          }
                        >
                          {deposit.claimed ? "Claimed" : "Locked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatDate(parseInt(deposit.lockedAt))}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {deposit.claimedAt
                          ? formatDate(parseInt(deposit.claimedAt))
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
