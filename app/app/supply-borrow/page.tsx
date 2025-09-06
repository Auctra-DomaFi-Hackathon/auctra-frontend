"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Activity } from "lucide-react";
import Image from "next/image";
import SupplyPanel from "./_components/panels/SupplyPanel";
import BorrowPanel from "./_components/panels/BorrowPanel";
import LendingPoolSkeleton from "./_components/loading/LendingPoolSkeleton";
import { useLendingPool, formatUSDC } from "@/hooks/useLendingPool";

export default function SupplyBorrowPage() {
  const { poolData, isLoadingPoolData } = useLendingPool();

  // Show skeleton loading state while pool data is loading
  if (isLoadingPoolData) {
    return <LendingPoolSkeleton />;
  }

  return (
    <div className="container mx-auto px-6 lg:px-12 py-10 space-y-8">
      {/* Page Header */}
      <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 shadow-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-white">
                  Domain Lending Pool
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                  Supply USDC to earn yield or borrow against your premium
                  domains
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600"
              >
                <Activity className="h-3 w-3 mr-1" />
                Pool Active
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pool Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value Locked (TVL)</p>
                <p className="text-lg font-semibold flex items-center gap-1 text-gray-900 dark:text-white">
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  {formatUSDC(poolData.totalAssets)}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg flex items-center justify-center">
                <Image
                  src="/images/LogoCoin/usd-coin-usdc-logo.png"
                  alt="USDC"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Borrowed</p>
                <p className="text-lg font-semibold flex items-center gap-1 text-gray-900 dark:text-white">
                  <Image
                    src="/images/LogoCoin/usd-coin-usdc-logo.png"
                    alt="USDC"
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  {formatUSDC(poolData.totalDebt)}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg flex items-center justify-center">
                <Image
                  src="/images/LogoCoin/usd-coin-usdc-logo.png"
                  alt="USDC"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Utilization Rate</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {((Number(poolData.utilization1e18) / 1e18) * 100).toFixed(1)}
                  %
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Borrow APR</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {(poolData.aprBps / 100).toFixed(1)}%
                </p>
              </div>
              <Layers className="h-8 w-8 text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SupplyPanel />
        <BorrowPanel />
      </div>

      {/* Pool Parameters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Layers className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Pool Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(poolData.ltvBps / 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Max LTV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(poolData.liqThresholdBps / 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Liquidation Threshold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white-600 dark:text-white-400">
                {(poolData.aprBps / 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Base Borrow APR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Grace Period</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
