// mocks.ts
import type { Market, DomainItem } from './types'
export const MOCK_MARKETS: Market[] = [
  { id:'pool-com', name:'.com Pool', ticker:'COM', loanToken:'USDC', chain:'Doma Testnet', totalSupplied:125000, lendAPR:3.4, borrowAPR:8.2, utilization:27 },
  { id:'pool-xyz', name:'.xyz Pool', ticker:'XYZ', loanToken:'USDC', chain:'Doma Testnet', totalSupplied:88600, lendAPR:2.9, borrowAPR:7.6, utilization:41 },
  { id:'pool-io', name:'.io Pool', ticker:'IO', loanToken:'USDT', chain:'Doma Testnet', totalSupplied:53200, lendAPR:3.8, borrowAPR:9.1, utilization:35 },
]
export const MOCK_DOMAINS: DomainItem[] = [
  { id:'d-alpha', label:'alpha.com', verified:true },
  { id:'d-beta',  label:'beta.xyz',  verified:true },
  { id:'d-gamma', label:'gamma.io',  verified:false },
]
