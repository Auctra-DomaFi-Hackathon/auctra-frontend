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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pause, Play, Edit, Trash2, Plus, Calendar, DollarSign } from "lucide-react";
import { useManageRentals } from "@/lib/rental/hooks";
import { formatUSD, formatDate, formatTimeLeft, getDaysLeft } from "@/lib/rental/format";
import { useState } from "react";
import EditTermsDialog from "./EditTermsDialog";
import ExtendDialog from "./ExtendDialog";
import { useToast } from "@/hooks/use-toast";

export default function ListingsTable() {
  const { myListings, loading, actions } = useManageRentals();
  const { toast } = useToast();
  const [editingListing, setEditingListing] = useState<number | null>(null);
  const [extendingListing, setExtendingListing] = useState<number | null>(null);

  const handlePauseToggle = async (id: number, currentPaused: boolean) => {
    try {
      await actions.pause(id, !currentPaused);
      toast({
        title: "Success!",
        description: `Listing ${!currentPaused ? 'paused' : 'unpaused'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const handleUnlist = async (id: number) => {
    if (!confirm("Are you sure you want to unlist this domain? This action cannot be undone.")) {
      return;
    }

    try {
      await actions.unlist(id);
      toast({
        title: "Success!",
        description: "Listing removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove listing",
        variant: "destructive",
      });
    }
  };

  const handleEndRent = async (id: number) => {
    if (!confirm("Are you sure you want to end this rental?")) {
      return;
    }

    try {
      await actions.endRent(id);
      toast({
        title: "Success!",
        description: "Rental ended successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to end rental",
        variant: "destructive",
      });
    }
  };

  const handleClaimDeposit = async (id: number) => {
    try {
      await actions.claimDeposit(id, "0x00000000000000000000000000000000000A11cE" as any);
      toast({
        title: "Success!",
        description: "Deposit claimed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim deposit",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (listing: any) => {
    if (listing.rental) {
      const now = Math.floor(Date.now() / 1000);
      const daysLeft = getDaysLeft(listing.rental.expires);
      const isExpired = now >= listing.rental.expires;
      
      return (
        <Badge 
          variant="default" 
          className={isExpired ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}
        >
          {isExpired ? "Expired" : `Rented (${daysLeft}d)`}
        </Badge>
      );
    }

    if (listing.listing.paused) {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          Paused
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
        Active
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">My Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (myListings.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No listings yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first rental listing to start earning from your domains.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">My Listings ({myListings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">Domain</TableHead>
                  <TableHead className="dark:text-gray-300">Token</TableHead>
                  <TableHead className="dark:text-gray-300">Price/Day</TableHead>
                  <TableHead className="dark:text-gray-300">Deposit</TableHead>
                  <TableHead className="dark:text-gray-300">Period</TableHead>
                  <TableHead className="dark:text-gray-300">Status</TableHead>
                  <TableHead className="dark:text-gray-300">Expires</TableHead>
                  <TableHead className="w-[100px] dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myListings.map((listing) => {
                  const now = Math.floor(Date.now() / 1000);
                  const isRented = !!listing.rental;
                  const isExpired = isRented && now >= listing.rental!.expires;
                  const canEndRent = isRented && isExpired;
                  const canExtend = isRented && !isExpired;
                  const canUnlist = !isRented;

                  return (
                    <TableRow key={listing.id} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-white">
                        {listing.domain}
                      </TableCell>
                      <TableCell className="font-mono text-sm dark:text-gray-300">
                        {listing.listing.tokenId.toString()}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatUSD(listing.listing.pricePerDay)}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatUSD(listing.listing.securityDeposit)}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {listing.listing.minDays}-{listing.listing.maxDays}d
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(listing)}
                      </TableCell>
                      <TableCell>
                        {isRented ? (
                          <span className="text-sm dark:text-gray-300">
                            {formatDate(listing.rental!.expires)}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePauseToggle(listing.id, listing.listing.paused)}>
                              {listing.listing.paused ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Unpause
                                </>
                              ) : (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => setEditingListing(listing.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Terms
                            </DropdownMenuItem>

                            {canUnlist && (
                              <DropdownMenuItem 
                                onClick={() => handleUnlist(listing.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Unlist
                              </DropdownMenuItem>
                            )}

                            {canExtend && (
                              <DropdownMenuItem onClick={() => setExtendingListing(listing.id)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Extend
                              </DropdownMenuItem>
                            )}

                            {canEndRent && (
                              <DropdownMenuItem 
                                onClick={() => handleEndRent(listing.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                End Rental
                              </DropdownMenuItem>
                            )}

                            {!isRented && (
                              <DropdownMenuItem onClick={() => handleClaimDeposit(listing.id)}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Claim Deposit
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingListing && (
        <EditTermsDialog
          listingId={editingListing}
          listing={myListings.find(l => l.id === editingListing)!}
          open={!!editingListing}
          onOpenChange={(open) => !open && setEditingListing(null)}
          onSuccess={() => setEditingListing(null)}
        />
      )}

      {extendingListing && (
        <ExtendDialog
          listingId={extendingListing}
          listing={myListings.find(l => l.id === extendingListing)!}
          open={!!extendingListing}
          onOpenChange={(open) => !open && setExtendingListing(null)}
          onSuccess={() => setExtendingListing(null)}
        />
      )}
    </>
  );
}