export interface Bid {
  id: string
  auctionId: string
  bidder: string
  amountUsd: number
  commitHash?: string | null
  revealedAmountUsd?: number | null
  revealSalt?: string | null
  timestamp: string
  txHash?: string | null
  isWinning?: boolean | null
}