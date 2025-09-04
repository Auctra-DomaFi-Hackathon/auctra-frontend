'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Eye } from 'lucide-react';
import { Countdown } from './Countdown';
import { formatCurrency, getCurrentDutchPrice } from '@/lib/utils/index';
import { cn } from '@/lib/utils';
import type { Auction, Domain } from '@/types';

interface AuctionCardProps {
  auction: Auction;
  domain: Domain;
  className?: string;
}

export function AuctionCard({ auction, domain, className }: AuctionCardProps) {
  const currentPrice = auction.type === 'dutch' && auction.parameters.dutch
    ? getCurrentDutchPrice(auction)
    : auction.parameters.sealed?.minDepositUsd || 0;

  const statusColor = {
    upcoming: 'secondary',
    active: 'default',
    reveal: 'outline',
    settled: 'secondary',
    canceled: 'destructive',
  } as const;

  const statusKey = (auction.status || 'active') as keyof typeof statusColor;

  return (
    <Card
      className={cn(
        'h-full min-h-[400px] md:min-h-[450px] rounded-2xl transition-all duration-200',
        'hover:shadow-xl hover:-translate-y-1 border-blue-100/80 dark:border-gray-700',
        'focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-400/30',
        'bg-white dark:bg-gray-800',
        className
      )}
      aria-label={`Auction card for ${domain.name}`}
    >
      {/* HEADER */}
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="text-lg sm:text-xl font-semibold mb-1 truncate text-gray-900 dark:text-white"
              title={domain.name}
            >
              {domain.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusColor[statusKey]} className="text-xs">
                {auction.type} • {auction.status}
              </Badge>
              {domain.dnsVerified && (
                <Badge variant="outline" className="text-[11px] border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                  <Eye className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* traffic score: hidden on xs */}
          <div className="sm:text-right">
            <div className="text-xs text-muted-foreground dark:text-gray-400">Traffic Score</div>
            <div className="flex sm:justify-end items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                {domain.trafficScore}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* BODY */}
      <CardContent className="space-y-4">
        {/* PRICE BLOCK (responsive grid) */}
        <div
          className={cn(
            'grid gap-3 rounded-xl border border-blue-100/80 dark:border-gray-700',
            'bg-blue-50/[0.35] dark:bg-gray-700/30 p-3 sm:p-4',
            auction.type === 'dutch' ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
              {auction.type === 'dutch' ? 'Current Price' : 'Min Deposit'}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400">
              {formatCurrency(currentPrice)}
            </div>
          </div>

          {auction.type === 'dutch' && auction.parameters.dutch && (
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">Floor</div>
              <div className="font-semibold sm:text-base text-gray-900 dark:text-white">
                {formatCurrency(auction.parameters.dutch.floorPriceUsd)}
              </div>
            </div>
          )}
        </div>

        {/* COUNTDOWN */}
        {auction.status === 'active' && (
          <div className="rounded-xl border border-blue-200/60 dark:border-gray-700 bg-blue-50/30 dark:bg-gray-700/20 p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center text-muted-foreground dark:text-gray-400 text-sm font-medium">
                <Clock className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                Auction ends in
              </div>
              <Countdown endTime={auction.endTime} className="scale-105" />
            </div>
          </div>
        )}

        {/* ORACLE INFO */}
        <div className="text-[13px] sm:text-sm text-muted-foreground dark:text-gray-400">
          Oracle Reserve: <span className="font-medium">{formatCurrency(domain.oracleReserveUsd || 0)}</span>{' '}
          • Confidence:{' '}
          <span className="font-medium">{Math.round((domain.oracleConfidence || 0) * 100)}%</span>
        </div>

        {/* CTA */}
        <Button asChild className="w-full sm:w-auto sm:self-end">
          <Link href={`/app/auction/${auction.id}`}>
            {auction.status === 'active' ? 'Place Bid' : 'View Auction'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
