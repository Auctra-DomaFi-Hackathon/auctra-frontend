'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_LENDING_POOL_ABI, USDC_ABI, DOMAIN_NFT_ABI } from './contracts/abis'

export interface LendingPoolData {
  totalAssets: bigint
  totalDebt: bigint
  exchangeRate: bigint
  currentRateBps: bigint
  utilization1e18: bigint
  ltvBps: number
  liqThresholdBps: number
  aprBps: number
}

export interface UserPosition {
  collateral: {
    owner: string
    nft: string
    tokenId: bigint
    valueUsd6: bigint
    active: boolean
  }
  debt: {
    principal: bigint
    lastAccrued: bigint
    liquidationEligibleAt: bigint
  }
  shares: bigint
  healthFactor: bigint
  maxBorrowable: bigint
}

export function useLendingPool() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Pool data
  const { data: totalAssets, isLoading: isLoadingTotalAssets } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'totalAssets',
  })

  const { data: totalDebt, isLoading: isLoadingTotalDebt } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'totalDebt',
  })

  const { data: exchangeRate, isLoading: isLoadingExchangeRate } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'exchangeRate',
  })

  const { data: currentRateBps, isLoading: isLoadingCurrentRate } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'currentRateBps',
  })

  const { data: utilization1e18, isLoading: isLoadingUtilization } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'utilization1e18',
  })

  const { data: ltvBps, isLoading: isLoadingLtv } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'ltvBps',
  })

  const { data: liqThresholdBps, isLoading: isLoadingLiqThreshold } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'liqThresholdBps',
  })

  const { data: aprBps, isLoading: isLoadingApr } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'aprBps',
  })

  // User-specific data
  const { data: userCollateral } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'collaterals',
    args: address ? [address] : undefined,
  })

  const { data: userDebt } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'debts',
    args: address ? [address] : undefined,
  })

  const { data: userShares } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'shares',
    args: address ? [address] : undefined,
  })

  const { data: healthFactor } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'healthFactor',
    args: address ? [address] : undefined,
  })

  const { data: maxBorrowable } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'maxBorrowable',
    args: address ? [address] : undefined,
  })

  // USDC balance and allowance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: usdcAllowance } = useReadContract({
    address: CONTRACTS.USDC as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.DomainLendingPool] : undefined,
  })

  // Aggregate loading state for pool data
  const isLoadingPoolData = isLoadingTotalAssets || isLoadingTotalDebt || isLoadingExchangeRate || 
    isLoadingCurrentRate || isLoadingUtilization || isLoadingLtv || isLoadingLiqThreshold || isLoadingApr

    const poolData: LendingPoolData = {
    totalAssets: (totalAssets as bigint) || BigInt(0),
    totalDebt: (totalDebt as bigint) || BigInt(0),
    exchangeRate: (exchangeRate as bigint) || parseUnits('1', 18),
    currentRateBps: (currentRateBps as bigint) || BigInt(0),
    utilization1e18: (utilization1e18 as bigint) || BigInt(0),
    ltvBps: Number(ltvBps || 0),
    liqThresholdBps: Number(liqThresholdBps || 0),
    aprBps: Number(aprBps || 0),
  }

  const userPosition: UserPosition = {
    collateral: userCollateral ? {
      owner: (userCollateral as any)[0],
      nft: (userCollateral as any)[1],
      tokenId: (userCollateral as any)[2],
      valueUsd6: (userCollateral as any)[3],
      active: (userCollateral as any)[4],
    } : {
      owner: '0x0000000000000000000000000000000000000000',
      nft: '0x0000000000000000000000000000000000000000',
      tokenId: BigInt(0),
      valueUsd6: BigInt(0),
      active: false,
    },
    debt: userDebt ? {
      principal: (userDebt as any)[0],
      lastAccrued: (userDebt as any)[1],
      liquidationEligibleAt: (userDebt as any)[2],
    } : {
      principal: BigInt(0),
      lastAccrued: BigInt(0),
      liquidationEligibleAt: BigInt(0),
    },
    shares: (userShares as bigint) || BigInt(0),
    healthFactor: (healthFactor as bigint) || BigInt(0),
    maxBorrowable: (maxBorrowable as bigint) || BigInt(0),
  }  // Contract interaction functions
  const approveUSDC = async (amount: bigint) => {
    writeContract({
      address: CONTRACTS.USDC as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACTS.DomainLendingPool, amount],
    })
  }

  const depositLiquidity = async (amount: bigint) => {
    writeContract({
      address: CONTRACTS.DomainLendingPool as `0x${string}`,
      abi: DOMAIN_LENDING_POOL_ABI,
      functionName: 'depositLiquidity',
      args: [amount],
    })
  }

  const withdrawLiquidity = async (amount: bigint) => {
    writeContract({
      address: CONTRACTS.DomainLendingPool as `0x${string}`,
      abi: DOMAIN_LENDING_POOL_ABI,
      functionName: 'withdrawLiquidity',
      args: [amount],
    })
  }

  const depositCollateral = async (nft: string, tokenId: bigint) => {
    writeContract({
      address: CONTRACTS.DomainLendingPool as `0x${string}`,
      abi: DOMAIN_LENDING_POOL_ABI,
      functionName: 'depositCollateral',
      args: [nft, tokenId],
    })
  }

  const withdrawCollateral = async () => {
    writeContract({
      address: CONTRACTS.DomainLendingPool as `0x${string}`,
      abi: DOMAIN_LENDING_POOL_ABI,
      functionName: 'withdrawCollateral',
    })
  }

  const borrow = async (amount: bigint) => {
    writeContract({
      address: CONTRACTS.DomainLendingPool as `0x${string}`,
      abi: DOMAIN_LENDING_POOL_ABI,
      functionName: 'borrow',
      args: [amount],
    })
  }

  const repay = async (amount: bigint) => {
    writeContract({
      address: CONTRACTS.DomainLendingPool as `0x${string}`,
      abi: DOMAIN_LENDING_POOL_ABI,
      functionName: 'repay',
      args: [amount],
    })
  }

  const approveNFT = async (nft: string, tokenId: bigint) => {
    writeContract({
      address: nft as `0x${string}`,
      abi: DOMAIN_NFT_ABI,
      functionName: 'approve',
      args: [CONTRACTS.DomainLendingPool, tokenId],
    })
  }

  return {
    // Data
    poolData,
    userPosition,
    usdcBalance: (usdcBalance as bigint) || BigInt(0),
    usdcAllowance: (usdcAllowance as bigint) || BigInt(0),
    
    // Loading states
    isLoadingPoolData,
    
    // Contract interactions
    approveUSDC,
    depositLiquidity,
    withdrawLiquidity,
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    approveNFT,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  }
}

// Helper functions for formatting
export const formatUSDC = (amount: bigint) => {
  const formatted = formatUnits(amount, 6)
  const number = parseFloat(formatted)
  return Math.floor(number).toLocaleString()
}

export const parseUSDC = (amount: string) => {
  return parseUnits(amount, 6)
}

export const formatAPR = (bps: number) => {
  return (bps / 100).toFixed(1) + '%'
}

export const formatHealthFactor = (healthFactor: bigint) => {
  if (healthFactor === BigInt(0)) return '∞'
  return (Number(healthFactor) / 1e18).toFixed(2)
}