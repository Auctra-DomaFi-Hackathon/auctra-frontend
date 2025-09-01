// app/app/create-pool/types.ts
export type Network = {
  id: string; 
  name: string; 
  chainId: number; 
  tag: string; 
  testnet: boolean;
};

export type CollateralCollection = {
  id: string; 
  name: string; 
  ticker: string; 
  standard: 'ERC-721'; 
  criteria: string; 
  sampleCount: number;
};

export type Erc20 = { 
  id: 'usdc'|'usdt'; 
  symbol: string; 
  name: string; 
  decimals: number 
};

export type IRM = { 
  id: string; 
  label: string; 
  address: string; 
  note?: string 
};

export type Oracle = { 
  id: string; 
  label: string; 
  address: string; 
  source?: string 
};

export type RiskPresetKey = 'conservative'|'moderate'|'aggressive';

export type PoolConfigDraft = {
  collateral?: CollateralCollection;
  loanToken?: Erc20;
  irm?: IRM;
  oracle?: Oracle;
  ltv?: number;     // %
  lth?: number;     // %
};

export type PoolConfigFinal = Required<PoolConfigDraft> & {
  createdAt: string;
  poolSlug: string; // e.g., "com-usdc-irm1-orc1-75-85"
};