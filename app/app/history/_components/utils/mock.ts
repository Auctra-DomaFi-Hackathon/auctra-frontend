import type { ActivityItem } from './types'
import { addDays, addHours } from './date'

export const MOCK: ActivityItem[] = [
  { id:'1', kind:'Auctions', title:'Auction created', subtitle:'Sealed Bid · reserve $2,000', domain:'alpha.com', time:new Date().toISOString() },
  { id:'2', kind:'Bids', title:'New bid placed', subtitle:'English Auction', amount:'$2,500 USDC', domain:'alpha.com', time:addHours(new Date(), -1).toISOString() },
  { id:'3', kind:'Wins/Losses', title:'You won the auction', subtitle:'Final price', amount:'$3,200 USDC', domain:'beta.xyz', time:addHours(new Date(), -3).toISOString() },
  { id:'4', kind:'Supply & Borrow', title:'Borrowed against collateral', subtitle:'Pool: Premium .com', amount:'$500 USDC', domain:'gamma.com', time:addDays(new Date(), -1).toISOString() },
  { id:'5', kind:'Liquidations', title:'Position flagged at risk', subtitle:'Health < 1.05', amount:'Debt $480', domain:'gamma.com', time:addDays(new Date(), -1.1).toISOString() },
  { id:'6', kind:'Alerts', title:'Reveal phase started', subtitle:'Sealed Bid', domain:'alpha.com', time:addDays(new Date(), -2).toISOString() },
  { id:'7', kind:'Wins/Losses', title:'You lost the auction', subtitle:'Top bid $1,150', domain:'delta.io', time:addDays(new Date(), -3).toISOString() },
]
