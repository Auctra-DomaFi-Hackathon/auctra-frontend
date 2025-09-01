// app/app/create-pool/mock.ts

// NFT collection = domain collateral (berbasis TLD/kurasi)
export const collateralCollections = [
  {
    id: 'col-com-premium',
    name: 'Premium .com Pool',
    ticker: 'COM',
    standard: 'ERC-721' as const,
    criteria: 'Verified premium .com via Doma',
    sampleCount: 120,
  },
  {
    id: 'col-xyz-trending',
    name: 'Trending .xyz Pool',
    ticker: 'XYZ',
    standard: 'ERC-721' as const,
    criteria: 'Traffic score > 70',
    sampleCount: 78,
  },
  {
    id: 'col-io-builder',
    name: 'Builder .io Pool',
    ticker: 'IO',
    standard: 'ERC-721' as const,
    criteria: 'Dev/tools/startup use-case',
    sampleCount: 42,
  },
];

// ERC-20 loan token (mock)
export const erc20Tokens = [
  { id: 'usdc' as const, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { id: 'usdt' as const, symbol: 'USDT', name: 'Tether USD', decimals: 6 },
];

// Interest Rate Models (mock address/id)
export const irmModels = [
  { id: 'irm-1', label: 'IRM Model #1', address: '0x613...e28fA', note: 'Linear 2–20% APR' },
  { id: 'irm-2', label: 'IRM Model #2', address: '0x763...4105Cc', note: 'Kinked 3–30% APR' },
  { id: 'irm-3', label: 'IRM Model #3', address: '0xA53...eB eAfE', note: 'Jump 5–60% APR' },
];

// Oracle providers (mock address/id)
export const oracleProviders = [
  { id: 'orc-1', label: 'Oracle #1', address: '0x64b...c30433E', source: 'Doma Floor + Traffic' },
  { id: 'orc-2', label: 'Oracle #2', address: '0x5fb...D4e3ccc', source: 'Sales comps + moving avg' },
  { id: 'orc-3', label: 'Oracle #3', address: '0x615...e20d6fE', source: 'Hybrid on/off-chain' },
];

// Preset risk
export const riskPresets = {
  conservative: { ltv: 50, lth: 70, label: 'Conservative' },
  moderate: { ltv: 65, lth: 80, label: 'Moderate' },
  aggressive: { ltv: 75, lth: 85, label: 'Aggressive' },
};

// contoh domain NFT milik user (untuk preview/supply nanti – opsional)
export const myDomains = [
  { id: 'dom-1', name: 'alpha.com', tld: 'com', trafficScore: 83, verified: true },
  { id: 'dom-2', name: 'gamma.io', tld: 'io', trafficScore: 72, verified: true },
  { id: 'dom-3', name: 'beta.xyz', tld: 'xyz', trafficScore: 68, verified: false },
];