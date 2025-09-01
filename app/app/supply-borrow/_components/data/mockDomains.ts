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

// Mock Positions Data untuk detail pages [slug]
export const MOCK_DOMAIN_POSITIONS: Record<string, DomainPosition> = {
  // .com domains
  'alpha-com': {
    id: 'pos-alpha-com-001',
    marketId: 'pool-com',
    marketName: 'Premium .com Pool',
    marketTicker: 'COM',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'alpha-com', label: 'alpha.com', verified: true },
    collateralUSD: 2500,
    debtUSD: 800,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.4,
    borrowAPR: 8.2,
    liquidationPrice: 1200,
  },
  'beta-com': {
    id: 'pos-beta-com-002',
    marketId: 'pool-com',
    marketName: 'Premium .com Pool',
    marketTicker: 'COM',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'beta-com', label: 'beta.com', verified: true },
    collateralUSD: 1800,
    debtUSD: 360,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.4,
    borrowAPR: 8.2,
    liquidationPrice: 900,
  },
  'gamma-com': {
    id: 'pos-gamma-com-003',
    marketId: 'pool-com',
    marketName: 'Premium .com Pool',
    marketTicker: 'COM',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'gamma-com', label: 'gamma.com', verified: false },
    collateralUSD: 3200,
    debtUSD: 1600,
    ltv: 70,
    lth: 85,
    status: 'At Risk',
    lendAPR: 3.4,
    borrowAPR: 8.2,
    liquidationPrice: 1600,
  },
  'delta-com': {
    id: 'pos-delta-com-004',
    marketId: 'pool-com',
    marketName: 'Premium .com Pool',
    marketTicker: 'COM',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'delta-com', label: 'delta.com', verified: true },
    collateralUSD: 1200,
    debtUSD: 240,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.4,
    borrowAPR: 8.2,
    liquidationPrice: 600,
  },
  'epsilon-com': {
    id: 'pos-epsilon-com-005',
    marketId: 'pool-com',
    marketName: 'Premium .com Pool',
    marketTicker: 'COM',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'epsilon-com', label: 'epsilon.com', verified: true },
    collateralUSD: 2800,
    debtUSD: 840,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.4,
    borrowAPR: 8.2,
    liquidationPrice: 1400,
  },

  // .xyz domains
  'alpha-xyz': {
    id: 'pos-alpha-xyz-006',
    marketId: 'pool-xyz',
    marketName: '.xyz Pool',
    marketTicker: 'XYZ',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'alpha-xyz', label: 'alpha.xyz', verified: true },
    collateralUSD: 950,
    debtUSD: 285,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 2.9,
    borrowAPR: 7.6,
    liquidationPrice: 475,
  },
  'beta-xyz': {
    id: 'pos-beta-xyz-007',
    marketId: 'pool-xyz',
    marketName: '.xyz Pool',
    marketTicker: 'XYZ',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'beta-xyz', label: 'beta.xyz', verified: true },
    collateralUSD: 1600,
    debtUSD: 480,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 2.9,
    borrowAPR: 7.6,
    liquidationPrice: 800,
  },
  'gamma-xyz': {
    id: 'pos-gamma-xyz-008',
    marketId: 'pool-xyz',
    marketName: '.xyz Pool',
    marketTicker: 'XYZ',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'gamma-xyz', label: 'gamma.xyz', verified: false },
    collateralUSD: 750,
    debtUSD: 375,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 2.9,
    borrowAPR: 7.6,
    liquidationPrice: 375,
  },
  'delta-xyz': {
    id: 'pos-delta-xyz-009',
    marketId: 'pool-xyz',
    marketName: '.xyz Pool',
    marketTicker: 'XYZ',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'delta-xyz', label: 'delta.xyz', verified: true },
    collateralUSD: 1100,
    debtUSD: 550,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 2.9,
    borrowAPR: 7.6,
    liquidationPrice: 550,
  },

  // .io domains
  'alpha-io': {
    id: 'pos-alpha-io-010',
    marketId: 'pool-io',
    marketName: '.io Pool',
    marketTicker: 'IO',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'alpha-io', label: 'alpha.io', verified: true },
    collateralUSD: 2100,
    debtUSD: 630,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.8,
    borrowAPR: 9.1,
    liquidationPrice: 1050,
  },
  'beta-io': {
    id: 'pos-beta-io-011',
    marketId: 'pool-io',
    marketName: '.io Pool',
    marketTicker: 'IO',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'beta-io', label: 'beta.io', verified: false },
    collateralUSD: 1650,
    debtUSD: 495,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.8,
    borrowAPR: 9.1,
    liquidationPrice: 825,
  },
  'gamma-io': {
    id: 'pos-gamma-io-012',
    marketId: 'pool-io',
    marketName: '.io Pool',
    marketTicker: 'IO',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'gamma-io', label: 'gamma.io', verified: true },
    collateralUSD: 1350,
    debtUSD: 675,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.8,
    borrowAPR: 9.1,
    liquidationPrice: 675,
  },
  'delta-io': {
    id: 'pos-delta-io-013',
    marketId: 'pool-io',
    marketName: '.io Pool',
    marketTicker: 'IO',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'delta-io', label: 'delta.io', verified: true },
    collateralUSD: 2750,
    debtUSD: 1375,
    ltv: 70,
    lth: 85,
    status: 'At Risk',
    lendAPR: 3.8,
    borrowAPR: 9.1,
    liquidationPrice: 1375,
  },

  // .org domains
  'alpha-org': {
    id: 'pos-alpha-org-014',
    marketId: 'pool-org',
    marketName: '.org Pool',
    marketTicker: 'ORG',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'alpha-org', label: 'alpha.org', verified: true },
    collateralUSD: 1800,
    debtUSD: 540,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.2,
    borrowAPR: 8.5,
    liquidationPrice: 900,
  },
  'beta-org': {
    id: 'pos-beta-org-015',
    marketId: 'pool-org',
    marketName: '.org Pool',
    marketTicker: 'ORG',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'beta-org', label: 'beta.org', verified: false },
    collateralUSD: 920,
    debtUSD: 276,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.2,
    borrowAPR: 8.5,
    liquidationPrice: 460,
  },

  // .net domains
  'alpha-net': {
    id: 'pos-alpha-net-016',
    marketId: 'pool-net',
    marketName: '.net Pool',
    marketTicker: 'NET',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'alpha-net', label: 'alpha.net', verified: true },
    collateralUSD: 1450,
    debtUSD: 435,
    ltv: 70,
    lth: 85,
    status: 'Safe',
    lendAPR: 3.1,
    borrowAPR: 8.0,
    liquidationPrice: 725,
  },
  'beta-net': {
    id: 'pos-beta-net-017',
    marketId: 'pool-net',
    marketName: '.net Pool',
    marketTicker: 'NET',
    loanToken: 'USDC',
    chain: 'Sepolia',
    domain: { id: 'beta-net', label: 'beta.net', verified: true },
    collateralUSD: 2200,
    debtUSD: 1100,
    ltv: 70,
    lth: 85,
    status: 'At Risk',
    lendAPR: 3.1,
    borrowAPR: 8.0,
    liquidationPrice: 1100,
  }
}

// Mock Data untuk Domain List
export const MOCK_DOMAIN_LIST: DomainListItem[] = [
  // .com domains
  {
    id: 'alpha-com',
    name: 'alpha.com',
    tld: '.com',
    verified: true,
    collateralValue: 2500,
    apr: 3.4,
    totalEarned: 523.89,
    status: 'Safe',
    pool: { name: 'Premium .com Pool', ticker: 'COM', loanToken: 'USDC' }
  },
  {
    id: 'beta-com',
    name: 'beta.com',
    tld: '.com',
    verified: true,
    collateralValue: 1800,
    apr: 3.4,
    totalEarned: 312.45,
    status: 'Safe',
    pool: { name: 'Premium .com Pool', ticker: 'COM', loanToken: 'USDC' }
  },
  {
    id: 'gamma-com',
    name: 'gamma.com',
    tld: '.com',
    verified: false,
    collateralValue: 3200,
    apr: 3.4,
    totalEarned: 667.22,
    status: 'At Risk',
    pool: { name: 'Premium .com Pool', ticker: 'COM', loanToken: 'USDC' }
  },
  {
    id: 'delta-com',
    name: 'delta.com',
    tld: '.com',
    verified: true,
    collateralValue: 1200,
    apr: 3.4,
    totalEarned: 189.67,
    status: 'Safe',
    pool: { name: 'Premium .com Pool', ticker: 'COM', loanToken: 'USDC' }
  },
  {
    id: 'epsilon-com',
    name: 'epsilon.com',
    tld: '.com',
    verified: true,
    collateralValue: 2800,
    apr: 3.4,
    totalEarned: 578.45,
    status: 'Safe',
    pool: { name: 'Premium .com Pool', ticker: 'COM', loanToken: 'USDC' }
  },

  // .xyz domains
  {
    id: 'alpha-xyz',
    name: 'alpha.xyz',
    tld: '.xyz',
    verified: true,
    collateralValue: 950,
    apr: 2.9,
    totalEarned: 145.32,
    status: 'Safe',
    pool: { name: '.xyz Pool', ticker: 'XYZ', loanToken: 'USDC' }
  },
  {
    id: 'beta-xyz',
    name: 'beta.xyz',
    tld: '.xyz',
    verified: true,
    collateralValue: 1600,
    apr: 2.9,
    totalEarned: 267.89,
    status: 'Safe',
    pool: { name: '.xyz Pool', ticker: 'XYZ', loanToken: 'USDC' }
  },
  {
    id: 'gamma-xyz',
    name: 'gamma.xyz',
    tld: '.xyz',
    verified: false,
    collateralValue: 750,
    apr: 2.9,
    totalEarned: 112.56,
    status: 'Safe',
    pool: { name: '.xyz Pool', ticker: 'XYZ', loanToken: 'USDC' }
  },
  {
    id: 'delta-xyz',
    name: 'delta.xyz',
    tld: '.xyz',
    verified: true,
    collateralValue: 1100,
    apr: 2.9,
    totalEarned: 189.23,
    status: 'Safe',
    pool: { name: '.xyz Pool', ticker: 'XYZ', loanToken: 'USDC' }
  },

  // .io domains
  {
    id: 'alpha-io',
    name: 'alpha.io',
    tld: '.io',
    verified: true,
    collateralValue: 2100,
    apr: 3.8,
    totalEarned: 445.67,
    status: 'Safe',
    pool: { name: '.io Pool', ticker: 'IO', loanToken: 'USDC' }
  },
  {
    id: 'beta-io',
    name: 'beta.io',
    tld: '.io',
    verified: false,
    collateralValue: 1650,
    apr: 3.8,
    totalEarned: 298.34,
    status: 'Safe',
    pool: { name: '.io Pool', ticker: 'IO', loanToken: 'USDC' }
  },
  {
    id: 'gamma-io',
    name: 'gamma.io',
    tld: '.io',
    verified: true,
    collateralValue: 1350,
    apr: 3.8,
    totalEarned: 234.78,
    status: 'Safe',
    pool: { name: '.io Pool', ticker: 'IO', loanToken: 'USDC' }
  },
  {
    id: 'delta-io',
    name: 'delta.io',
    tld: '.io',
    verified: true,
    collateralValue: 2750,
    apr: 3.8,
    totalEarned: 612.33,
    status: 'At Risk',
    pool: { name: '.io Pool', ticker: 'IO', loanToken: 'USDC' }
  },

  // .org domains
  {
    id: 'alpha-org',
    name: 'alpha.org',
    tld: '.org',
    verified: true,
    collateralValue: 1800,
    apr: 3.2,
    totalEarned: 334.12,
    status: 'Safe',
    pool: { name: '.org Pool', ticker: 'ORG', loanToken: 'USDC' }
  },
  {
    id: 'beta-org',
    name: 'beta.org',
    tld: '.org',
    verified: false,
    collateralValue: 920,
    apr: 3.2,
    totalEarned: 156.89,
    status: 'Safe',
    pool: { name: '.org Pool', ticker: 'ORG', loanToken: 'USDC' }
  },

  // .net domains
  {
    id: 'alpha-net',
    name: 'alpha.net',
    tld: '.net',
    verified: true,
    collateralValue: 1450,
    apr: 3.1,
    totalEarned: 245.67,
    status: 'Safe',
    pool: { name: '.net Pool', ticker: 'NET', loanToken: 'USDC' }
  },
  {
    id: 'beta-net',
    name: 'beta.net',
    tld: '.net',
    verified: true,
    collateralValue: 2200,
    apr: 3.1,
    totalEarned: 445.23,
    status: 'At Risk',
    pool: { name: '.net Pool', ticker: 'NET', loanToken: 'USDC' }
  }
]

// Helper function untuk mendapatkan domain position by slug
export function getDomainPosition(slug: string): DomainPosition | null {
  return MOCK_DOMAIN_POSITIONS[slug] || null
}

// Helper function untuk mendapatkan semua domain list
export function getAllDomains(): DomainListItem[] {
  return MOCK_DOMAIN_LIST
}

// Helper function untuk mendapatkan domains by TLD
export function getDomainsByTLD(tld: string): DomainListItem[] {
  return MOCK_DOMAIN_LIST.filter(domain => domain.tld === tld)
}