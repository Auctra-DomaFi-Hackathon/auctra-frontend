import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Doma Testnet
export const domaTestnet = defineChain({
  id: 97476,
  name: 'Doma Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.doma.xyz'],
      webSocket: ['wss://ws-testnet.doma.xyz'],
    },
    public: {
      http: ['https://rpc-testnet.doma.xyz'],
      webSocket: ['wss://ws-testnet.doma.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Doma Testnet Explorer',
      url: 'https://explorer-testnet.doma.xyz',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Auctra - Domain Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [domaTestnet],
  ssr: true,
});