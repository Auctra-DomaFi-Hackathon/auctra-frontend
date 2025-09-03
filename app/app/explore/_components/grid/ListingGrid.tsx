'use client'

import { useState } from 'react'
import type { Listing, NFTMetadata } from '@/lib/graphql/types'
import { formatEther } from 'ethers'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStrategyName } from '@/lib/utils/strategy'
import BidDialog from '@/components/auction/BidDialog'

interface ListingWithMetadata extends Listing {
  metadata?: NFTMetadata
}

export default function ListingGrid({
  listings,
  emptyLabel,
}: {
  listings: ListingWithMetadata[]
  emptyLabel: string
}) {
  const [selectedListing, setSelectedListing] = useState<ListingWithMetadata | null>(null)
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false)

  const handlePlaceBid = (listing: ListingWithMetadata) => {
    setSelectedListing(listing)
    setIsBidDialogOpen(true)
  }
  if (!listings.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-600">{emptyLabel}</p>
      </div>
    )
  }

  const formatPrice = (priceWei: string) => {
    try {
      return `${parseFloat(formatEther(priceWei)).toLocaleString()} ETH`
    } catch {
      return `${priceWei} wei`
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {listings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {listing.metadata?.name || `Token #${listing.tokenId.slice(-8)}`}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {listing.metadata?.tld || '.eth'}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {listing.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Seller: {formatAddress(listing.seller)}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Reserve Price:</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatPrice(listing.reservePrice)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Strategy:</span>
                <Badge 
                  variant={listing.strategy ? "default" : "outline"} 
                  className={listing.strategy ? "bg-purple-100 text-purple-700" : "text-gray-500"}
                >
                  {getStrategyName(listing.strategy)}
                </Badge>
              </div>
              
              {listing.metadata?.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {listing.metadata.description}
                </p>
              )}
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Listed: {new Date(parseInt(listing.createdAt) * 1000).toLocaleDateString()}</span>
                <span>Token: {listing.tokenId.slice(0, 8)}...</span>
              </div>
              
              {listing.paymentToken === '0x0000000000000000000000000000000000000000' ? (
                <div className="text-xs text-gray-500">Payment: ETH</div>
              ) : (
                <div className="text-xs text-gray-500">
                  Payment: {formatAddress(listing.paymentToken)}
                </div>
              )}

              {/* Place Bid Button */}
              <div className="pt-2">
                <Button 
                  onClick={() => handlePlaceBid(listing)}
                  disabled={!listing.strategy || listing.strategy === '0x0000000000000000000000000000000000000000'}
                  className="w-full"
                  size="sm"
                >
                  {getStrategyName(listing.strategy) === 'Dutch Auction' ? 'Buy Now' : 
                   getStrategyName(listing.strategy) === 'Sealed Bid Auction' ? 'Commit Bid' : 
                   'Place Bid'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bid Dialog */}
      <BidDialog 
        isOpen={isBidDialogOpen}
        onClose={() => {
          setIsBidDialogOpen(false)
          setSelectedListing(null)
        }}
        listing={selectedListing}
      />
    </>
  )
}