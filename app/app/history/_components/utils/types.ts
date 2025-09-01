export type EventKind =
  | 'Auctions'
  | 'Bids'
  | 'Wins/Losses'
  | 'Supply & Borrow'
  | 'Liquidations'
  | 'Alerts'
  | 'Renting'

export interface ActivityItem {
  id: string
  kind: EventKind
  title: string
  subtitle?: string
  amount?: string
  txHash?: string
  domain?: string
  time: string // ISO
}
