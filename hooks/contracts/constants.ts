import { defineChain } from 'viem'

export const CONTRACTS = {
  DomainNFT: "0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f",
  FeeManager: "0xaCd0B6598768d597Ad6c322f88969E687617Dd28",
  RegistrarBridge: "0x76D2559Dc8C5C092649C2A0dDFb3d6395157CC18",
  EnglishAuction: "0x947e70b9362eeCA8a3994F839Ebcc2C1c7d63C5d",
  DutchAuction: "0x084DA94314FE36Cf957191A78a7d6395dC951686",
  SealedBidAuction: "0x7Cb994c76074064E6003f7DE048c35A285055c5C",
  DomainAuctionHouse: "0x346d94b66072D8b9d678058073A0fe7eF449f03f",
  USDC: "0xdA340408191fb16ab4FD83A28C3D344ab308b090",
  DomainLendingPool: "0x133272720610d669Fa4C5891Ab62a302455585Dd",
  MockDomainOracle: "0xDd868480112DcADb32364d933755eecb71D9262C"
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