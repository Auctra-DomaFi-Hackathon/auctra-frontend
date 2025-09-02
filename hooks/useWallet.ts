'use client'

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { DOMA_TESTNET } from './contracts/constants'

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const isOnDomaTestnet = chainId === DOMA_TESTNET.id

  const connectWallet = () => {
    const injectedConnector = connectors.find(connector => 
      connector.type === 'injected'
    )
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  const switchToDomaTestnet = async () => {
    try {
      if (window.ethereum) {
        // Try to switch chain first
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x17C64' }], // 97476 in hex
        })
      }
    } catch (switchError: any) {
      // If chain is not added, add it first
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x17C64',
              chainName: 'Doma Testnet',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://rpc-testnet.doma.xyz'],
              blockExplorerUrls: ['https://explorer-testnet.doma.xyz']
            }]
          })
        } catch (addError) {
          console.error('Failed to add Doma Testnet:', addError)
          throw addError
        }
      } else {
        console.error('Failed to switch to Doma Testnet:', switchError)
        throw switchError
      }
    }
  }

  return {
    address,
    isConnected,
    chainId,
    isOnDomaTestnet,
    connectWallet,
    disconnect,
    switchToDomaTestnet,
  }
}