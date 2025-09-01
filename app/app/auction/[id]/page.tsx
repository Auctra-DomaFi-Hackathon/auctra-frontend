'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

import { useAuctionData } from './_components/useAuctionData'
import { useSealedPhase } from './_components/ useSealedPhase'

import LoadingState from './_components/LoadingState'
import NotFound from './_components/NotFound'
import AuctionHero from './_components/AuctionHero'
import DutchPanel from './_components/PricePanel/DutchPanel'
import SealedPanel from './_components/PricePanel/SealedPanel'
import AuctionTabs from './_components/AuctionTabs/AuctionTabs'
import AlertsPanel from './_components/AlertsPanel'
import RelatedAuctions from './_components/RelatedAuctions'

export default function AuctionDetailPage() {
  const params = useParams()
  const auctionId = params.id as string

  const {
    loading,
    error,
    auction,
    domain,
    bids,
    relatedAuctions,
    allDomains,
    watchers,
    bidAmount,
    setBidAmount,
    alerts,
    setAlerts,
    handlePlaceBid,
    handleCommitBid,
    handleRevealBid,
    currentPrice,
    isDutch,
    isSealed,
    auctionStatus,
  } = useAuctionData(auctionId)

  const phase = useSealedPhase(auction)

  if (loading) return <LoadingState label="Loading auction..." />

  if (error || !auction || !domain) {
    return (
      <NotFound
        message={error || 'The auction you are looking for does not exist.'}
        action={<Button onClick={() => window.history.back()}>Go Back</Button>}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <AuctionHero
            domain={domain}
            watchers={watchers}
            auctionStatus={auctionStatus}
            endTime={auction.endTime}
          />

          {/* Price Panel */}
          {isDutch && (
            <DutchPanel
              currentPrice={currentPrice}
              onBuyNow={handlePlaceBid}
            />
          )}

          {isSealed && (
            <SealedPanel
              phase={phase}
              bidsCount={bids.length}
              bidAmount={bidAmount}
              setBidAmount={setBidAmount}
              onCommitBid={handleCommitBid}
              onRevealBid={handleRevealBid}
            />
          )}

          {/* Tabs */}
          <AuctionTabs
            auction={auction}
            domain={domain}
          />

          {/* Alerts */}
          <AlertsPanel
            isSealed={isSealed}
            alerts={alerts}
            setAlerts={setAlerts}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RelatedAuctions
            relatedAuctions={relatedAuctions}
            allDomains={allDomains}
          />
        </div>
      </div>
    </div>
  )
}
