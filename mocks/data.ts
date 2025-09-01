import type { Domain, Auction, Bid, User, Notification, Transfer, ActivityItem } from '@/types'

export const mockDomains: Domain[] = [
  {
    id: 'd1',
    name: 'bluechain.com',
    tld: '.com',
    status: 'expiring',
    expiresAt: '2025-01-15T00:00:00.000Z',
    owner: null,
    dnsVerified: true,
    trafficScore: 87,
    renewalCostUsd: 12,
    oracleReserveUsd: 4200,
    fairValueBandUsd: { min: 3800, max: 5200 },
    oracleConfidence: 0.82,
    nftTokenId: null,
    currentAuctionId: 'a1'
  },
  {
    id: 'd2',
    name: 'whitelabs.io',
    tld: '.io',
    status: 'expiring',
    expiresAt: '2024-12-07T00:00:00.000Z',
    owner: null,
    dnsVerified: true,
    trafficScore: 64,
    renewalCostUsd: 45,
    oracleReserveUsd: 1100,
    fairValueBandUsd: { min: 900, max: 1400 },
    oracleConfidence: 0.74,
    nftTokenId: null,
    currentAuctionId: 'a2'
  },
  {
    id: 'd3',
    name: 'domafi.xyz',
    tld: '.xyz',
    status: 'active',
    expiresAt: '2026-05-20T00:00:00.000Z',
    owner: '0xabc...def',
    dnsVerified: true,
    trafficScore: 32,
    renewalCostUsd: 10,
    oracleReserveUsd: 250,
    fairValueBandUsd: { min: 200, max: 350 },
    oracleConfidence: 0.61,
    nftTokenId: '777',
    currentAuctionId: null
  }
]

export const mockAuctions: Auction[] = [
  {
    id: 'a1',
    domainId: 'd1',
    type: 'dutch',
    status: 'active',
    startTime: '2025-08-18T07:00:00.000Z',
    endTime: '2025-08-19T07:00:00.000Z',
    revealStart: null,
    revealEnd: null,
    parameters: {
      dutch: { startPriceUsd: 6000, floorPriceUsd: 3000, durationSec: 86400 },
      sealed: null
    },
    feesBps: { protocol: 150, creator: 50 },
    antiSnipingExtensionSec: 120,
    activity: [
      {
        type: 'buy',
        actor: '0x123...999',
        amountUsd: null,
        timestamp: '2025-08-18T09:10:00.000Z',
        txHash: null
      }
    ]
  },
  {
    id: 'a2',
    domainId: 'd2',
    type: 'sealed',
    status: 'upcoming',
    startTime: '2025-08-20T06:00:00.000Z',
    endTime: '2025-08-21T06:00:00.000Z',
    revealStart: '2025-08-21T06:05:00.000Z',
    revealEnd: '2025-08-21T12:05:00.000Z',
    parameters: {
      sealed: { minDepositUsd: 100, minIncrementPct: 5 },
      dutch: null
    },
    feesBps: { protocol: 150, creator: 50 },
    antiSnipingExtensionSec: 60,
    activity: []
  }
]

export const mockBids: Bid[] = [
  {
    id: 'b1',
    auctionId: 'a1',
    bidder: '0xbid...001',
    amountUsd: 5200,
    commitHash: null,
    revealedAmountUsd: null,
    revealSalt: null,
    timestamp: '2025-08-18T08:00:00.000Z',
    txHash: null,
    isWinning: null
  }
]

export const mockUser: User = {
  address: '0xb1ma...dev',
  username: 'bima',
  email: 'bima@example.com',
  watchlistDomainIds: ['d1', 'd2'],
  notifChannels: { wallet: true, email: true, telegram: false }
}

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'outbid',
    payload: { auctionId: 'a1', domain: 'bluechain.com' },
    createdAt: '2025-08-18T08:05:00.000Z',
    read: false,
    deepLink: '/auction/a1'
  }
]

export const mockTransfers: Transfer[] = [
  {
    id: 't1',
    domainId: 'd3',
    status: 'processing',
    registrarTicket: 'RG-2025-0012',
    txHash: null,
    updatedAt: '2025-08-17T13:00:00.000Z'
  }
]

export const mockOrderbook = {
  recentSales: [
    {
      type: 'settle' as const,
      actor: '0xabc...111',
      amountUsd: 4100,
      timestamp: '2025-08-17T10:00:00.000Z',
      txHash: '0xsale1'
    }
  ]
}