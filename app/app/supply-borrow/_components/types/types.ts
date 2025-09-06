// Mock Domain Data for Supply-Borrow
export interface DomainPosition {
  id: string
  marketId: string
  marketName: string
  marketTicker: string
  loanToken: 'USDC' | 'USDT' | 'DAI'
  chain: 'Sepolia' | 'Base Sepolia' | 'OP Sepolia' | 'Doma Testnet'
  domain: {
    id: string
    label: string
    verified: boolean
  }
  collateralUSD: number
  debtUSD: number
  ltv: number
  lth: number
  status: 'Safe' | 'At Risk'
  lendAPR: number
  borrowAPR: number
  liquidationPrice?: number
}

export interface DomainListItem {
  id: string
  name: string
  tld: string
  verified: boolean
  collateralValue: number
  apr: number
  totalEarned: number
  status: 'Safe' | 'At Risk'
  pool: {
    name: string
    ticker: string
    loanToken: string
  }
}
