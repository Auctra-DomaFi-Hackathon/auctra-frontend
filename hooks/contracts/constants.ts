import { defineChain } from 'viem'

export const CONTRACTS = {
  DomainNFT: process.env.NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ADDRESS as `0x${string}`,
  FeeManager: process.env.NEXT_PUBLIC_FEE_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
  RegistrarBridge: process.env.NEXT_PUBLIC_REGISTRAR_BRIDGE_CONTRACT_ADDRESS as `0x${string}`,
  EnglishAuction: process.env.NEXT_PUBLIC_ENGLISH_AUCTION_CONTRACT_ADDRESS as `0x${string}`,
  DutchAuction: process.env.NEXT_PUBLIC_DUTCH_AUCTION_CONTRACT_ADDRESS as `0x${string}`, 
  SealedBidAuction: process.env.NEXT_PUBLIC_SEALED_BID_AUCTION_CONTRACT_ADDRESS as `0x${string}`,
  DomainAuctionHouse: process.env.NEXT_PUBLIC_DOMAIN_AUCTION_HOUSE_CONTRACT_ADDRESS as `0x${string}`,

  USDC: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`,
  DomainLendingPool: process.env.NEXT_PUBLIC_DOMAIN_LENDING_POOL as `0x${string}`,
  MockDomainOracle: process.env.NEXT_PUBLIC_MOCK_DOMAIN_ORACLE as `0x${string}`,
  DomainRentalVault: process.env.NEXT_PUBLIC_DOMAIN_RENTAL_VAULT as `0x${string}`,
  Treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`,
} as const;

export const DOMA_TESTNET = defineChain({
  id: 97476,
  name: 'Doma Testnet',
  network: 'doma-testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.doma.xyz'],
    },
    public: {
      http: ['https://rpc-testnet.doma.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Doma Explorer', url: 'https://explorer-testnet.doma.xyz' },
  },
})