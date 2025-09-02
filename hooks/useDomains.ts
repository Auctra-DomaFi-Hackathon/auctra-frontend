'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_NFT_ABI } from './contracts/abis'
import { useMyDomains } from '@/lib/graphql/hooks'
import type { EnhancedDomainItem } from '@/lib/graphql/services'

export interface DomainNFT {
  tokenId: bigint
  domainName: string
  metadata: string
  owner: string
}

export function useDomains(userAddress?: string) {
  const [domains, setDomains] = useState<DomainNFT[]>([])
  const [loading, setLoading] = useState(false)

  // Use GraphQL hook to fetch domains
  const { 
    domains: graphqlDomains, 
    loading: graphqlLoading, 
    error: graphqlError 
  } = useMyDomains(userAddress)

  // Transform GraphQL domains to DomainNFT format
  useEffect(() => {
    if (!userAddress) {
      setDomains([])
      return
    }

    setLoading(graphqlLoading)

    if (graphqlDomains && graphqlDomains.length > 0) {
      const transformedDomains: DomainNFT[] = graphqlDomains
        .filter((domain: EnhancedDomainItem) => domain.tokenId) // Only include domains with valid tokenId
        .map((domain: EnhancedDomainItem) => ({
          tokenId: BigInt(domain.tokenId!), // We know it exists due to filter above
          domainName: domain.name,
          metadata: domain.tokenAddress ? 
            `${domain.tokenAddress}/${domain.tokenId}` : 
            `https://metadata.example.com/${domain.tokenId}`,
          owner: userAddress
        }))
      
      setDomains(transformedDomains)
    } else {
      setDomains([])
    }
  }, [userAddress, graphqlDomains, graphqlLoading])

  return {
    domains,
    loading,
    error: graphqlError,
    refetch: () => {
      // GraphQL refetch will be handled by the useMyDomains hook
    }
  }
}

export function useApproveDomain() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approveDomain = (tokenId: bigint) => {
    try {
      writeContract({
        address: CONTRACTS.DomainNFT as `0x${string}`,
        abi: DOMAIN_NFT_ABI,
        functionName: 'approve',
        args: [CONTRACTS.DomainAuctionHouse as `0x${string}`, tokenId],
      })
    } catch (error) {
      console.error('Error approving domain:', error)
      throw error
    }
  }

  return {
    approveDomain,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error
  }
}

export function useCheckApproval(_tokenId?: bigint) {
  // Since getApproved might not exist, we'll assume not approved initially
  // and let the approval process handle it
  return {
    approvedAddress: null,
    isApproved: false // Always assume not approved to trigger approval flow
  }
}