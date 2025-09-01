'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import KV from './primitives/KV'
import { AuctionCard } from '@/features/auction/AuctionCard'

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
function money(n: number) { return `$${(n ?? 0).toLocaleString()}` }
function fmtDatetime(v?: string) { if (!v) return '—'; try { return new Date(v).toLocaleString() } catch { return v! } }

export default function StepPreview({
  formData,
  back,
  busy,
  handleSubmit,
  setCurrentStep,
}: {
  formData: any
  back: () => void
  busy: boolean
  handleSubmit: () => Promise<void> | void
  setCurrentStep: (s: any) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auction Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Auction Details</h3>
              <div className="space-y-2 text-sm">
                <KV k="Domain" v={formData.domain || '-'} />
                <KV k="Type" v={cap(formData.auctionType)} />
                {formData.auctionType === 'dutch' && (
                  <>
                    <KV k="Start Price" v={money(formData.startPrice)} />
                    <KV k="End Price" v={money(formData.endPrice ?? 0)} />
                    <KV k="Decay Interval" v={`${formData.decayInterval ?? 0} min`} />
                  </>
                )}
                {formData.auctionType === 'sealed' && (
                  <>
                    <KV k="Minimum Bid" v={money(formData.minBid ?? 0)} />
                    <KV k="Commit Window" v={`${formData.commitWindow ?? 0} h`} />
                    <KV k="Reveal Window" v={`${formData.revealWindow ?? 0} h`} />
                  </>
                )}
                <KV k="Start" v={fmtDatetime(formData.startTime)} />
                <KV k="End" v={fmtDatetime(formData.endTime)} />
                <KV k="Auto-listing" v={formData.autoListing ? 'Yes' : 'No'} />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Preview Card</h3>
              <AuctionCard
                auction={{
                  id: 'preview',
                  domainId: formData.domainId || 'preview',
                  type: formData.auctionType,
                  status: 'upcoming',
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  revealStart: formData.auctionType === 'sealed' ? formData.startTime : null,
                  revealEnd: formData.auctionType === 'sealed' ? formData.endTime : null,
                  parameters: {
                    dutch:
                      formData.auctionType === 'dutch'
                        ? {
                            startPriceUsd: formData.startPrice,
                            floorPriceUsd: formData.endPrice || 0,
                            durationSec: formData.decayInterval || 3600,
                          }
                        : null,
                    sealed:
                      formData.auctionType === 'sealed'
                        ? {
                            minDepositUsd: formData.minBid || 0,
                            minIncrementPct: (formData.minIncrement || 0) / 100,
                          }
                        : null,
                  },
                  feesBps: { protocol: 250, creator: 250 },
                  antiSnipingExtensionSec: 300,
                  activity: [],
                }}
                domain={{
                  id: formData.domainId || 'preview',
                  name: formData.domain || 'example.com',
                  tld: formData.domain ? '.' + formData.domain.split('.').pop() : '.com',
                  status: 'active',
                  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                  owner: 'preview-owner',
                  dnsVerified: true,
                  trafficScore: 85,
                  renewalCostUsd: 12,
                  oracleReserveUsd: formData.reservePrice || 1000,
                  fairValueBandUsd: {
                    min: (formData.reservePrice || 1000) * 0.8,
                    max: (formData.reservePrice || 1000) * 1.2,
                  },
                  oracleConfidence: 0.85,
                  nftTokenId: null,
                  currentAuctionId: null,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={busy} className="bg-blue-600 hover:bg-blue-700">
          {busy ? 'Creating…' : 'Create Auction'}
        </Button>
      </div>
    </div>
  )
}
