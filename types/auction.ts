export interface Auction {
  id: string
  domainId: string
  type: 'dutch' | 'sealed'
  status: 'upcoming' | 'active' | 'reveal' | 'settled' | 'canceled'
  startTime: string
  endTime: string
  revealStart?: string | null
  revealEnd?: string | null
  parameters: {
    dutch?: {
      startPriceUsd: number
      floorPriceUsd: number
      durationSec: number
    } | null
    sealed?: {
      minDepositUsd: number
      minIncrementPct: number
    } | null
  }
  feesBps: {
    protocol: number
    creator: number
  }
  antiSnipingExtensionSec: number
  activity: ActivityItem[]
}

export interface ActivityItem {
  type: 'bid' | 'buy' | 'list' | 'reveal' | 'settle'
  actor: string
  amountUsd?: number | null
  timestamp: string
  txHash?: string | null
}