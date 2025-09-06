"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BadgeMinus } from "lucide-react";
import SortHead from "./SortHead";
import StatusChip from "./StatusChip";
import SkeletonRows from "./SkeletonRows";
import EmptyRow from "./EmptyRow";
import { useSort } from "../hooks/useSort";
import type { AuctionRow } from "../hooks/useDashboardData";
import { CurrencyEth } from "@phosphor-icons/react/dist/icons/CurrencyEth";
import Image from "next/image";
import { useEndAuction } from "@/hooks/useEndAuction";
import EndAuctionSuccessDialog from "@/components/auction/EndAuctionSuccessDialog";
import EndAuctionConfirmDialog from "@/components/auction/EndAuctionConfirmDialog";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { openEndAuctionSuccessAtom } from "@/atoms/transactions";

export default function AuctionsTable({ rows }: { rows: AuctionRow[] }) {
  const aSort = useSort(rows);
  const { endAuction, getAuctionState, resetAuctionState } = useEndAuction();
  const [, openSuccessDialog] = useAtom(openEndAuctionSuccessAtom);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    auction: AuctionRow | null;
  }>({ isOpen: false, auction: null });

  // Monitor all auctions for success state
  useEffect(() => {
    if (!rows) return;

    rows.forEach((row) => {
      const state = getAuctionState(row.listingId);
      if (state.isSuccess && state.hash) {
        openSuccessDialog({
          hash: state.hash,
          domain: `${row.domain}${row.tld}`,
        });
        resetAuctionState(row.listingId);
      }
    });
  }, [rows, getAuctionState, resetAuctionState, openSuccessDialog]);

  const handleEndAuctionClick = (auction: AuctionRow) => {
    setConfirmDialog({ isOpen: true, auction });
  };

  const handleConfirmEndAuction = () => {
    if (confirmDialog.auction) {
      endAuction(confirmDialog.auction.listingId).catch((error) => {
        console.error("Failed to end auction:", error);
      });
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, auction: null });
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          {/* <Box className="h-5 w-5 text-blue-600" /> */}
          <CurrencyEth className="text-blue-600 dark:text-blue-400 h-5 w-5" />
          My Auctions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50/40 dark:bg-gray-700/50">
              <TableRow className="border-gray-200 dark:border-gray-600">
                <SortHead
                  onClick={() => aSort.toggle("domain")}
                  active={aSort.key === "domain"}
                  dir={aSort.dir}
                  className="w-28"
                >
                  Domain
                </SortHead>
                <SortHead
                  onClick={() => aSort.toggle("tld")}
                  active={aSort.key === "tld"}
                  dir={aSort.dir}
                  className="w-16"
                >
                  TLD
                </SortHead>
                <SortHead
                  onClick={() => aSort.toggle("type")}
                  active={aSort.key === "type"}
                  dir={aSort.dir}
                  className="w-28"
                >
                  Type
                </SortHead>
                <SortHead
                  onClick={() => aSort.toggle("state")}
                  active={aSort.key === "state"}
                  dir={aSort.dir}
                  className="w-16"
                >
                  State
                </SortHead>
                <SortHead
                  onClick={() => aSort.toggle("timeLeft")}
                  active={aSort.key === "timeLeft"}
                  dir={aSort.dir}
                  className="w-20"
                >
                  Status
                </SortHead>
                <SortHead
                  onClick={() => aSort.toggle("createdAt")}
                  active={aSort.key === "createdAt"}
                  dir={aSort.dir}
                  className="w-24"
                >
                  Date Created
                </SortHead>
                <SortHead
                  onClick={() => aSort.toggle("tld")}
                  active={aSort.key === "tld"}
                  dir={aSort.dir}
                  className="w-20"
                >
                  Chain
                </SortHead>
                <SortHead
                  onClick={() => aSort.toggle("top")}
                  active={aSort.key === "top"}
                  dir={aSort.dir}
                  className="text-right w-24"
                >
                  Reserve Price
                </SortHead>
                <SortHead
                  onClick={() => {}}
                  active={false}
                  dir="asc"
                  className="text-center w-10"
                >
                  Actions
                </SortHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows === undefined ? (
                <SkeletonRows cols={10} message="Loading domain data..." />
              ) : aSort.sorted.length === 0 ? (
                <EmptyRow message="No auctions yet" colSpan={10} />
              ) : (
                aSort.sorted.map((r) => (
                  <TableRow
                    key={r.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition border-gray-200 dark:border-gray-700"
                  >
                    <TableCell className="font-medium w-28 text-gray-900 dark:text-white">
                      {r.domain}
                    </TableCell>
                    <TableCell className="text-blue-600 dark:text-blue-400 font-semibold w-16">
                      {r.tld}
                    </TableCell>
                    <TableCell className="w-28 text-gray-700 dark:text-gray-300">
                      {r.type} Auction
                    </TableCell>
                    <TableCell className="w-16">
                      <StatusChip state={r.state} />
                    </TableCell>
                    <TableCell className="w-20 text-gray-700 dark:text-gray-300">
                      {r.timeLeft}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400 w-24">
                      {r.createdAt}
                    </TableCell>
                    <TableCell className="w-20">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/images/logo/domaLogo.svg"
                          alt="Doma"
                          width={50}
                          height={20}
                          className="rounded-sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right w-24 text-gray-900 dark:text-white">
                      {r.top}
                      <Image
                        src="/images/LogoCoin/eth-logo.svg"
                        alt="ETH"
                        width={20}
                        height={12}
                        className="rounded-full inline-block ml-2 mb-1"
                      />
                    </TableCell>
                    <TableCell className="text-center w-20">
                      {r.state === "LIVE" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndAuctionClick(r)}
                          disabled={getAuctionState(r.listingId).isLoading}
                          className="h-8 px-3"
                        >
                          {getAuctionState(r.listingId).isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "End Auction"
                          )} <BadgeMinus className="inline-block text-red-600" />
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          -
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <EndAuctionSuccessDialog />
      
      {/* Confirmation Dialog */}
      <EndAuctionConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmEndAuction}
        domain={confirmDialog.auction?.domain || ""}
        tld={confirmDialog.auction?.tld || ""}
        isLoading={confirmDialog.auction ? getAuctionState(confirmDialog.auction.listingId).isLoading : false}
      />
    </Card>
  );
}
