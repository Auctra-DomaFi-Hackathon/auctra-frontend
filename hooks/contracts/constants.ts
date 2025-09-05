import { defineChain } from 'viem'

export const CONTRACTS = {
  DomainNFT: "0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f",
  FeeManager: "0x0d03cF675aF0bd9cAe503BC5Fa2762804867356B",
  RegistrarBridge: "0x0272AD2345a2eB27b2db3F436Fb25Da69b66ea48",
  EnglishAuction: "0x2CD3f3f8aeb2ad0db8325401B402a3B3724e0F7a",
  DutchAuction: "0x0d11150F7351BA646f1Ad6bd1EA4AdCd0f88e98b",
  SealedBidAuction: "0xd2F7db7925d653F8b2ff74848C9d90A5E37713A2",
  DomainAuctionHouse: "0x83760459190611Dd86cFD6fb209c24A291317bf7",


  USDC: "0xdA340408191fb16ab4FD83A28C3D344ab308b090",
  DomainLendingPool: "0x133272720610d669Fa4C5891Ab62a302455585Dd",
  MockDomainOracle: "0xDd868480112DcADb32364d933755eecb71D9262C",
  DomainRentalVault: "0x57Cf6d83589Da81DBB8fD99bcA48B64f52f89eA7",
  Treasury: "0xebFACa8463E1c3495a09684137fEd7A4b4574179"
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