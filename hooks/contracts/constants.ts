import { defineChain } from 'viem'

export const CONTRACTS = {
  DomainNFT: "0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f",
  FeeManager: "0xC012068d6B3A237EfDcE1Cc19e4148aC00B1b9d3",
  RegistrarBridge: "0x3F3CFb2baceF6F1CABE8460a0cCbaf66aE5981C0",
  EnglishAuction: "0x4B4E01051ea200689a8562c182C66FDc6343c501",
  DutchAuction: "0x14b9C2670A9D4279f5776c3E60b29044696F61f9",
  SealedBidAuction: "0x71C4b800757A9C8aa6eDCBCB95ad5f96A1381b64",
  DomainAuctionHouse: "0xcF85Ac32327526DAFcd8E313c6CA9E9c2A2C231f",


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