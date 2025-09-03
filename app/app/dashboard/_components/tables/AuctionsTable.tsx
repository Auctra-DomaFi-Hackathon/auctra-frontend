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
import { Box } from "lucide-react";
import SortHead from "./SortHead";
import StatusChip from "./StatusChip";
import SkeletonRows from "./SkeletonRows";
import EmptyRow from "./EmptyRow";
import { useSort } from "../hooks/useSort";
import type { AuctionRow } from "../hooks/useDashboardData";
import { CurrencyEth } from "@phosphor-icons/react/dist/icons/CurrencyEth";
import Image from "next/image";

export default function AuctionsTable({ rows }: { rows: AuctionRow[] }) {
  const aSort = useSort(rows);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {/* <Box className="h-5 w-5 text-blue-600" /> */}
          <CurrencyEth className="text-blue-600 h-5 w-5" />
          My Auctions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50/40">
              <TableRow>
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
                  Top Bid/Price
                </SortHead>
                {/* <th className="text-right px-4 py-2">Actions</th> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows === undefined ? (
                <SkeletonRows cols={9} message="Loading domain data..." />
              ) : aSort.sorted.length === 0 ? (
                <EmptyRow message="No auctions yet" colSpan={9} />
              ) : (
                aSort.sorted.map((r) => (
                  <TableRow
                    key={r.id}
                    className="hover:bg-blue-50/30 transition"
                  >
                    <TableCell className="font-medium w-28">
                      {r.domain}
                    </TableCell>
                    <TableCell className="text-blue-600 font-semibold w-16">
                      {r.tld}
                    </TableCell>
                    <TableCell className="w-28">{r.type} Auction</TableCell>
                    <TableCell className="w-16">
                      <StatusChip state={r.state} />
                    </TableCell>
                    <TableCell className="w-20">{r.timeLeft}</TableCell>
                    <TableCell className="text-sm text-gray-600 w-24">
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
                    <TableCell className="text-right w-24">{r.top}</TableCell>
                    {/* <TableCell className="text-right">
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
