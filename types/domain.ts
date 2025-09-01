export interface Domain {
  id: string
  name: string
  tld?: string
  status?: 'expiring' | 'active' | 'sold'
  expiresAt?: string
  owner?: string | null
  dnsVerified?: boolean
  verified?: boolean
  trafficScore?: number
  renewalCostUsd?: number
  oracleReserveUsd?: number
  fairValueBandUsd?: {
    min: number
    max: number
  }
  oracleConfidence?: number
  nftTokenId?: string | null
  currentAuctionId?: string | null
  tokenAddress?: string
  tokenId?: string
  tokenChain?: string
}