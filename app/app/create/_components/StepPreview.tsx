'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
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
  wallet,
  isApproving,
  auctionStep,
  currentApproval,
  isApproved,
}: {
  formData: any
  back: () => void
  busy: boolean
  handleSubmit: () => Promise<void> | void
  setCurrentStep: (s: any) => void
  wallet?: any
  isApproving?: boolean
  auctionStep?: string
  currentApproval?: boolean
  isApproved?: boolean
}) {
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Auction Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Auction Details</h3>
              <div className="space-y-2 text-sm">
                <KV k="Domain" v={formData.domain || '-'} />
                <KV k="Type" v={cap(formData.auctionType)} />
                {formData.auctionType === 'english' && (
                  <KV k="Min Increment" v={`${formData.minIncrement ?? 0}%`} />
                )}
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
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Preview Card</h3>
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

      {/* Wallet Status */}
      {wallet && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Wallet Status:</span>
                <span className={`text-sm ${wallet.isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {wallet.isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {wallet.isConnected && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Network:</span>
                  <div className="flex items-center gap-2">
                    {wallet.isOnDomaTestnet && (
                      <Image
                        src="/images/logo/domaLogo.svg"
                        alt="Doma Testnet"
                        width={50}
                        height={16}
                        className="rounded-sm"
                      />
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Domain Approval:</span>
                <span className={`text-sm ${
                  currentApproval || isApproved 
                    ? 'text-green-600 dark:text-green-400' 
                    : isApproving 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {currentApproval || isApproved 
                    ? 'Approved' 
                    : isApproving 
                      ? 'Approving...' 
                      : 'Needs Approval'
                  }
                </span>
              </div>
              {auctionStep && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Auction Creation Progress:</span>
                    {busy && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-xs text-blue-600 dark:text-blue-400">Please confirm transactions in wallet</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className={`px-2 py-1 rounded text-center ${
                      auctionStep === 'list' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 animate-pulse' :
                      ['criteria', 'strategy', 'start', 'completed'].includes(auctionStep) ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {auctionStep === 'list' ? '⏳ List' : 
                       ['criteria', 'strategy', 'start', 'completed'].includes(auctionStep) ? '✅ List' : 
                       'List'}
                    </div>
                    <div className={`px-2 py-1 rounded text-center ${
                      auctionStep === 'criteria' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 animate-pulse' :
                      ['strategy', 'start', 'completed'].includes(auctionStep) ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {auctionStep === 'criteria' ? '⏳ Criteria' :
                       ['strategy', 'start', 'completed'].includes(auctionStep) ? '✅ Criteria' :
                       'Criteria'}
                    </div>
                    <div className={`px-2 py-1 rounded text-center ${
                      auctionStep === 'strategy' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 animate-pulse' :
                      ['start', 'completed'].includes(auctionStep) ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {auctionStep === 'strategy' ? '⏳ Strategy' :
                       ['start', 'completed'].includes(auctionStep) ? '✅ Strategy' :
                       'Strategy'}
                    </div>
                    <div className={`px-2 py-1 rounded text-center ${
                      auctionStep === 'start' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 animate-pulse' :
                      auctionStep === 'completed' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {auctionStep === 'start' ? '⏳ Go Live' :
                       auctionStep === 'completed' ? '✅ Go Live' :
                       'Go Live'}
                    </div>
                  </div>
                  {busy && (
                    <div className="text-center">
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        ⚠️ Please dont refresh or leave this page while transactions are processing
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} className="border-gray-300 dark:border-gray-600 text-black hover:bg-gray-50 dark:hover:bg-gray-700">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={busy} className="bg-blue-600 hover:bg-blue-700">
          {isApproving 
            ? 'Approving Domain...' 
            : auctionStep && auctionStep === 'list'
              ? 'Listing Domain'
            : auctionStep === 'criteria'
              ? 'Setting Criteria... (Please confirm in wallet)'
            : auctionStep === 'strategy'
              ? 'Choosing Strategy... (Please confirm in wallet)'
            : auctionStep === 'start'
              ? 'Going Live... (Please confirm in wallet)'
            : busy 
              ? 'Processing...' 
              : 'Create Auction'
          }
        </Button>
      </div>
    </div>
  )
}
