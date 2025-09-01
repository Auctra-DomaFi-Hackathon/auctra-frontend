// types.ts
export type Chain = 'Sepolia' | 'Base Sepolia' | 'OP Sepolia' | 'Doma Testnet'       
export interface Market { id: string; name: string; ticker: string; loanToken: 'USDC'|'USDT'|'DAI'; chain: Chain; totalSupplied: number; lendAPR: number; borrowAPR: number; utilization: number }
export interface DomainItem { id: string; label: string; verified: boolean }
export interface Position { id: string; marketId: string; domain: DomainItem; collateralUSD: number; debtUSD: number; ltv: number; lth: number; status: 'Safe'|'At Risk' }
