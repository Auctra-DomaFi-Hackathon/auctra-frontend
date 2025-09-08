"use client"

import { memo, useState, useCallback } from 'react'
import type { Listing, NFTMetadata } from "@/lib/graphql/types"
import { formatEther } from "ethers"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStrategyName } from "@/lib/utils/strategy"
import LazyImage from "@/components/ui/LazyImage"
import { useLazyComponent } from "@/hooks/useLazyLoading"

interface ListingWithMetadata extends Listing {
  metadata?: NFTMetadata
}

interface LazyListingCardProps {
  listing: ListingWithMetadata
  currentPrice?: string
  auctionTime?: { startTime: number; endTime: number }
  onPlaceBid: (listing: ListingWithMetadata) => void
  onViewDetails: (listing: ListingWithMetadata) => void
  index: number
}

const LazyListingCard = memo(function LazyListingCard({
  listing,
  currentPrice,
  auctionTime,
  onPlaceBid,
  onViewDetails,
  index
}: LazyListingCardProps) {
  const { shouldRender, ref } = useLazyComponent(`listing-card-${listing.id}`, 0.1)
  const [isHovered, setIsHovered] = useState(false)
  
  const handlePlaceBid = useCallback(() => {
    onPlaceBid(listing)
  }, [onPlaceBid, listing])
  
  const handleViewDetails = useCallback(() => {
    onViewDetails(listing)
  }, [onViewDetails, listing])
  
  // Skeleton/placeholder while not in view
  if (!shouldRender) {
    return (
      <div 
        ref={ref}
        className="h-[400px] rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 animate-pulse"
      />
    )
  }
  
  const strategy = getStrategyName(listing.strategy)
  const isDutch = strategy === "Dutch Auction"
  const price = isDutch && currentPrice ? currentPrice : listing.reservePrice
  
  const formatPrice = (priceWei: string) => {
    try {
      const full = formatEther(priceWei)
      const n = parseFloat(full)
      if (n === 0 && priceWei !== "0") return `${full} ETH`
      if (n > 0 && n < 0.001) return `${n.toFixed(6)} ETH`
      return `${n.toLocaleString()} ETH`
    } catch {
      return `${priceWei} wei`
    }
  }
  
  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}…${address.slice(-4)}`
  
  const Row = ({
    label,
    value,
  }: {
    label: string
    value: React.ReactNode
  }) => (
    <div className="flex items-center justify-between text-[12.5px] text-neutral-600 dark:text-neutral-400">
      <span>{label}</span>
      <span className="text-neutral-800 dark:text-neutral-200">{value}</span>
    </div>
  )
  
  const TypePill = ({ text }: { text: string }) => (
    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800">
      {text}
    </span>
  )
  
  return (
    <Card
      ref={ref}
      className={`group cursor-pointer rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900 ${
        isHovered ? 'shadow-md -translate-y-[1px]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <CardHeader className="space-y-1.5 p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
                {listing.metadata?.name || `Token #${listing.tokenId.slice(-8)}`}
              </h3>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
                {listing.metadata?.tld || ".eth"}
              </span>
            </div>
            <div className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
              Seller: {formatAddress(listing.seller)}
            </div>
          </div>
          <Badge
            variant="outline"
            className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800"
          >
            {listing.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-medium text-neutral-700 dark:text-neutral-300">
            {isDutch ? "Open bid" : strategy === "English Auction" ? "Start bid" : "Reserve"}
          </span>
          <span className="font-mono text-[16px] font-semibold text-blue-600 dark:text-blue-400">
            {formatPrice(price)}
            <LazyImage
              src="/images/LogoCoin/eth-logo.svg"
              alt="ETH"
              width={18}
              height={18}
              className="ml-1 inline-block align-[-3px]"
            />
          </span>
        </div>

        {/* Type */}
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-medium text-neutral-700 dark:text-neutral-300">
            Auction Type
          </span>
          <TypePill text={strategy} />
        </div>

        {/* Meta description (1 line) */}
        {listing.metadata?.description && (
          <p className="line-clamp-1 text-[12.5px] text-neutral-600 dark:text-neutral-400">
            {listing.metadata.description}
          </p>
        )}

        {/* Domain + Expiry */}
        <Row
          label="Domain"
          value={
            <span className="truncate font-medium">
              {listing.metadata?.name
                ? `${listing.metadata.name}${listing.metadata.tld || ""}`
                : "—"}
            </span>
          }
        />
        <Row
          label="Domain Expires"
          value={
            listing.metadata?.expiresAt
              ? new Date(listing.metadata.expiresAt * 1000).toLocaleDateString()
              : "Unknown"
          }
        />

        {/* Timeline */}
        {auctionTime && (
          <div className="space-y-1">
            <Row
              label="Auction Start"
              value={new Date(auctionTime.startTime * 1000).toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <Row
              label="Auction End"
              value={new Date(auctionTime.endTime * 1000).toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>
        )}

        {/* Chain */}
        <div className="flex items-center justify-between pt-1 text-[12px]">
          <span className="font-semibold text-blue-800 dark:text-blue-300">
            Chain
          </span>
          <LazyImage
            src="/images/logo/domaLogo.svg"
            alt="Doma Chain"
            width={46}
            height={16}
            className="opacity-90"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <Button
            onClick={handlePlaceBid}
            disabled={
              !listing.strategy ||
              listing.strategy === "0x0000000000000000000000000000000000000000"
            }
            className="h-9 w-full rounded-lg bg-blue-600 text-[13px] hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            size="sm"
          >
            {isDutch ? "Buy Now" : strategy === "Sealed Bid Auction" ? "Commit Bid" : "Place Bid"}
          </Button>
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="h-9 w-full rounded-lg border-blue-200 text-[13px] text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export default LazyListingCard