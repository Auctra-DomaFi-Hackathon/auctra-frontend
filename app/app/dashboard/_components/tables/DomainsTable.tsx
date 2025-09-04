"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, ExternalLink } from "lucide-react";
import Image from "next/image";
import SortHead from "./SortHead";
import SkeletonRows from "./SkeletonRows";
import EmptyRow from "./EmptyRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSort } from "../hooks/useSort";
import type { DomainRow } from "../hooks/useDashboardData";
import { useAccount } from "wagmi";

export default function DomainsTable({ rows }: { rows: DomainRow[] }) {
  const { isConnected } = useAccount();
  const dSort = useSort(rows);

  console.log("DomainsTable - received rows:", rows);
  console.log("DomainsTable - wallet connected:", isConnected);

  const getEmptyMessage = () => {
    if (!isConnected) {
      return "Connect your wallet to view your domains";
    }
    if (rows.length === 0) {
      return "No domains found for this wallet";
    }
    return "No domains found";
  };

  const renderChainCell = (tokenChain?: string) => {
    if (!tokenChain) return "N/A";

    // Jika chain adalah Doma Testnet, tampilkan dengan logo
    if (tokenChain === "Doma Testnet") {
      return (
        <div className="flex items-center justify-center">
          <Image
            src="/images/logo/domaLogo.svg"
            alt="Doma"
            width={50}
            height={20}
            className="object-contain"
          />
          {/* <span className="text-sm text-gray-600">Doma Testnet</span> */}
        </div>
      );
    }

    // Untuk chain lainnya, tampilkan text biasa
    return <span className="text-sm text-gray-600">{tokenChain}</span>;
  };

  const renderTokenAddressCell = (tokenAddress?: string) => {
    if (!tokenAddress) return "N/A";

    const explorerUrl = `https://explorer-testnet.doma.xyz/token/${tokenAddress}`;
    const shortAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

    return (
      <div className="flex items-center justify-center gap-1">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
          title={`View ${tokenAddress} on Doma Explorer`}
        >
          <span className="font-mono text-sm">{shortAddress}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          My Domains
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50/40 dark:bg-gray-700/50">
              <TableRow className="border-gray-200 dark:border-gray-600">
                <SortHead
                  onClick={() => dSort.toggle("domain")}
                  active={dSort.key === "domain"}
                  dir={dSort.dir}
                >
                  Domain
                </SortHead>
                <SortHead
                  onClick={() => dSort.toggle("tld")}
                  active={dSort.key === "tld"}
                  dir={dSort.dir}
                >
                  TLD
                </SortHead>
                <SortHead
                  onClick={() => dSort.toggle("status")}
                  active={dSort.key === "status"}
                  dir={dSort.dir}
                >
                  Status
                </SortHead>
                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Expires</th>
                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Token Address</th>
                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Token ID</th>
                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Chain</th>
                <th className="text-right px-4 py-2 text-gray-700 dark:text-gray-300">Actions</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows === undefined ? (
                <SkeletonRows cols={10} message="Loading domain data..." />
              ) : dSort.sorted.length === 0 ? (
                <EmptyRow message={getEmptyMessage()} colSpan={10} />
              ) : (
                dSort.sorted.map((r) => (
                  <TableRow
                    key={r.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition border-gray-200 dark:border-gray-700"
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-white">{r.domain}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{r.tld}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600"
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center justify-center">
                        {r.expiresAt
                          ? new Date(r.expiresAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {renderTokenAddressCell(r.tokenAddress)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {r.tokenId ? (
                        <span
                          title={r.tokenId}
                          className="flex items-center justify-center"
                        >
                          {r.tokenId.length > 12
                            ? `${r.tokenId.slice(0, 8)}...${r.tokenId.slice(
                                -4
                              )}`
                            : r.tokenId}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{renderChainCell(r.tokenChain)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </TableCell>
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
