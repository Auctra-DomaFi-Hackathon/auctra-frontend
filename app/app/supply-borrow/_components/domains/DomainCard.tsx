"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, TrendingUp, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { type DomainListItem } from "../data/mockDomains";
import Image from "next/image";

interface DomainCardProps {
  domain: DomainListItem;
}

export default function DomainCard({ domain }: DomainCardProps) {
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAPR = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleViewDetails = () => {
    router.push(`/app/supply-borrow/${domain.id}`);
  };

  const getTokenLogo = (token: string) => {
    const tokenLogos: Record<string, string> = {
      USDC: "/images/LogoCoin/usd-coin-usdc-logo.png",
      USDT: "/images/LogoCoin/tether-usdt-logo.png",
      DAI: "/images/LogoCoin/multi-collateral-dai-dai-logo.png",
    };
    return tokenLogos[token] || "/images/LogoCoin/usd-coin-usdc-logo.png";
  };

  return (
    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:justify-between mb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">
                {domain.tld}
              </span>
            </div>
            <div className="flex-1 sm:flex-initial">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {domain.name}
                </h3>
                {domain.verified && (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {domain.pool.name} ({domain.pool.ticker})
              </p>
            </div>
          </div>
          <Badge
            variant={domain.status === "Safe" ? "secondary" : "destructive"}
            className={`${
              domain.status === "Safe" ? "bg-green-100 text-green-700" : ""
            } text-xs sm:text-sm flex-shrink-0 self-start sm:self-center mt-2 sm:mt-0`}
          >
            {domain.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Coins className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500 hidden sm:inline">
                Domain Value
              </span>
              <span className="text-xs text-gray-500 sm:hidden">Value</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 break-all">
              {formatCurrency(domain.collateralValue)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">APR</span>
            </div>
            <p className="text-sm font-semibold text-green-600">
              {formatAPR(domain.apr)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-xs text-gray-500 hidden sm:inline">
                Loan Token
              </span>
              <span className="text-xs text-gray-500 sm:hidden">Token</span>
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Image
                src={getTokenLogo(domain.pool.loanToken)}
                alt={`${domain.pool.loanToken} logo`}
                width={16}
                height={16}
                className="sm:w-5 sm:h-5"
              />
              <p className="text-sm font-semibold text-gray-900">
                {domain.pool.loanToken}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={handleViewDetails}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 sm:py-2.5"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            className="sm:px-4 px-3 text-sm sm:text-base py-2 sm:py-2.5"
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
