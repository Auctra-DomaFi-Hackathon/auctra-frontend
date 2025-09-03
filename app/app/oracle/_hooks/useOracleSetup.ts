'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '@/hooks/contracts/constants'
import { DOMAIN_ORACLE_ABI } from '@/hooks/contracts/abis'

interface DomainInfoParams {
  nftContract: string
  tokenId: bigint
  isPremium: boolean
  valueUsd6: bigint
  expiresAt: bigint
}

export function useOracleSetup() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setDomainInfo = async (params: DomainInfoParams) => {
    writeContract({
      address: CONTRACTS.MockDomainOracle as `0x${string}`,
      abi: DOMAIN_ORACLE_ABI,
      functionName: 'setInfo',
      args: [
        params.nftContract as `0x${string}`,
        params.tokenId,
        params.isPremium,
        params.valueUsd6,
        params.expiresAt
      ],
    })
  }

  return {
    setDomainInfo,
    isDomainInfoLoading: isPending,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}