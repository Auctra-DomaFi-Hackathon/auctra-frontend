'use client'

import { useState, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_RENTAL_VAULT_ABI, USDC_ABI } from './contracts/abis'
import { toast } from '@/hooks/use-toast'
import { parseUnits, formatUnits } from 'viem'

export interface RentalCostBreakdown {
  rentalFee: bigint
  protocolFee: bigint
  securityDeposit: bigint
  totalPayment: bigint
  ownerReceives: bigint
  days: number
}

export function useRentDomain() {
  const { address } = useAccount()
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  
  // Write contract hook
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    error: writeError 
  } = useWriteContract()

  // Wait for transaction receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Read protocol fee
  const { data: feeBps } = useReadContract({
    address: CONTRACTS.DomainRentalVault,
    abi: DOMAIN_RENTAL_VAULT_ABI,
    functionName: 'feeBps',
  })

  // Calculate rental costs based on the documentation flow
  const calculateRentalCost = useCallback(async (
    pricePerDay: bigint,
    securityDeposit: bigint,
    days: number
  ): Promise<RentalCostBreakdown> => {
    const feeBpsValue = Number(feeBps || 200) // Default 2% fee

    const rentalFee = pricePerDay * BigInt(days)
    const protocolFee = (rentalFee * BigInt(feeBpsValue)) / BigInt(10000)
    const totalPayment = rentalFee + securityDeposit // Total to approve/pay
    const ownerReceives = rentalFee - protocolFee

    return {
      rentalFee,
      protocolFee,
      securityDeposit,
      totalPayment,
      ownerReceives,
      days
    }
  }, [feeBps])

  // Check USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  })

  // Check USDC allowance for rental vault
  const { data: usdcAllowance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.DomainRentalVault] : undefined,
    query: {
      enabled: !!address
    }
  })

  // Format USDC amounts for display
  const formatUSDC = useCallback((amount: bigint) => {
    return `$${formatUnits(amount, 6)}`
  }, [])

  // Check if user has sufficient balance
  const hasSufficientBalance = useCallback((totalAmount: bigint) => {
    if (!usdcBalance) return false
    return usdcBalance >= totalAmount
  }, [usdcBalance])

  // Check if user has sufficient allowance
  const hasSufficientAllowance = useCallback((totalAmount: bigint) => {
    if (!usdcAllowance) return false
    return usdcAllowance >= totalAmount
  }, [usdcAllowance])

  // Step 1: Approve USDC for rental payment
  const approveUSDC = useCallback(async (amount: bigint) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setCurrentAction('approve-usdc')
      
      writeContract({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.DomainRentalVault, amount],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // Step 2: Rent domain
  const rentDomain = useCallback(async (listingId: number, days: number) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    // Validate days
    if (days < 1 || days > 365) {
      throw new Error('Rental days must be between 1 and 365')
    }

    try {
      setCurrentAction('rent')
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'rent',
        args: [BigInt(listingId), days],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // Extend existing rental
  const extendRental = useCallback(async (listingId: number, extraDays: number) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (extraDays < 1) {
      throw new Error('Extra days must be at least 1')
    }

    try {
      setCurrentAction('extend')
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'extend',
        args: [BigInt(listingId), extraDays],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // End expired rental (anyone can call)
  const endRental = useCallback(async (listingId: number) => {
    try {
      setCurrentAction('end-rent')
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'endRent',
        args: [BigInt(listingId)],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [writeContract])

  // Claim security deposit after rental ended
  const claimDeposit = useCallback(async (listingId: number, to: `0x${string}`) => {
    try {
      setCurrentAction('claim-deposit')
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'claimDeposit',
        args: [BigInt(listingId), to],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [writeContract])

  // Reset current action when transaction is confirmed or fails
  const resetAction = useCallback(() => {
    setCurrentAction(null)
  }, [])

  // Get rental status for a listing
  const getRentalStatus = useCallback(async (listingId: number) => {
    try {
      const listingResult = await useReadContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'getListing',
        args: [BigInt(listingId)],
      })

      const rentalResult = await useReadContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'getRental',
        args: [BigInt(listingId)],
      })

      // This would need to be handled differently in the component
      // For now, return a helper function
      return { listingId, needsStatusCheck: true }
    } catch (error) {
      console.error('Failed to get rental status:', error)
      return null
    }
  }, [])

  // Helper function to check if rental is expired (client-side)
  const isRentalExpired = useCallback((expiresTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000)
    return now >= expiresTimestamp
  }, [])

  // Helper function to get time remaining (client-side)
  const getTimeRemaining = useCallback((expiresTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000)
    if (expiresTimestamp <= now) return 0
    return expiresTimestamp - now // seconds remaining
  }, [])

  return {
    // State
    currentAction,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: writeError || receiptError || null,

    // Balance & Allowance Info
    usdcBalance: usdcBalance || BigInt(0),
    usdcAllowance: usdcAllowance || BigInt(0),
    feeBps: Number(feeBps || 200),

    // Helper functions
    calculateRentalCost,
    formatUSDC,
    hasSufficientBalance,
    hasSufficientAllowance,
    isRentalExpired,
    getTimeRemaining,
    getRentalStatus,

    // Write functions - Renter Flow (Step 1 & 2)
    approveUSDC,     // Step 1: Approve USDC payment
    rentDomain,      // Step 2: Start rental

    // Additional rental management functions
    extendRental,    // Extend active rental
    endRental,       // End expired rental (anyone can call)
    claimDeposit,    // Claim security deposit

    // Utility
    resetAction,
  }
}