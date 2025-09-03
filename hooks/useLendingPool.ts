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
  const { data: totalAssets } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'totalAssets',
  })

  const { data: totalDebt } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'totalDebt',
  })

  const { data: exchangeRate } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'exchangeRate',
  })

  const { data: currentRateBps } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'currentRateBps',
  })

  const { data: utilization1e18 } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'utilization1e18',
  })

  const { data: ltvBps } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'ltvBps',
  })

  const { data: liqThresholdBps } = useReadContract({
    address: CONTRACTS.DomainLendingPool as `0x${string}`,
    abi: DOMAIN_LENDING_POOL_ABI,
    functionName: 'liqThresholdBps',
  })

  const { data: aprBps } = useReadContract({
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

  const poolData: LendingPoolData = {
    totalAssets: totalAssets || BigInt(0),
    totalDebt: totalDebt || BigInt(0),
    exchangeRate: exchangeRate || parseUnits('1', 18),
    currentRateBps: currentRateBps || BigInt(0),
    utilization1e18: utilization1e18 || BigInt(0),
    ltvBps: Number(ltvBps || 0),
    liqThresholdBps: Number(liqThresholdBps || 0),
    aprBps: Number(aprBps || 0),
  }

  const userPosition: UserPosition = {
    collateral: userCollateral ? {
      owner: userCollateral[0],
      nft: userCollateral[1],
      tokenId: userCollateral[2],
      valueUsd6: userCollateral[3],
      active: userCollateral[4],
    } : {
      owner: '0x0000000000000000000000000000000000000000',
      nft: '0x0000000000000000000000000000000000000000',
      tokenId: BigInt(0),
      valueUsd6: BigInt(0),
      active: false,
    },
    debt: userDebt ? {
      principal: userDebt[0],
      lastAccrued: userDebt[1],
      liquidationEligibleAt: userDebt[2],
    } : {
      principal: BigInt(0),
      lastAccrued: BigInt(0),
      liquidationEligibleAt: BigInt(0),
    },
    shares: userShares || BigInt(0),
    healthFactor: healthFactor || BigInt(0),
    maxBorrowable: maxBorrowable || BigInt(0),
  }

  // Contract interaction functions
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
    usdcBalance: usdcBalance || 0n,
    usdcAllowance: usdcAllowance || 0n,
    
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
  return formatUnits(amount, 6)
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