'use client'

import { useState, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_RENTAL_VAULT_ABI, DOMAIN_NFT_ABI, USDC_ABI } from './contracts/abis'
import { toast } from '@/hooks/use-toast'
import { parseUnits } from 'viem'

export interface RentalListing {
  nft: `0x${string}`
  tokenId: bigint
  owner: `0x${string}`
  paymentToken: `0x${string}`
  pricePerDay: bigint
  securityDeposit: bigint
  minDays: number
  maxDays: number
  paused: boolean
}

export interface RentalInfo {
  user: `0x${string}`
  expires: bigint
}

export function useRentalVault() {
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

  // Read functions
  const { data: nextId } = useReadContract({
    address: CONTRACTS.DomainRentalVault,
    abi: DOMAIN_RENTAL_VAULT_ABI,
    functionName: 'nextId',
  })

  const { data: feeBps } = useReadContract({
    address: CONTRACTS.DomainRentalVault,
    abi: DOMAIN_RENTAL_VAULT_ABI,
    functionName: 'feeBps',
  })

  const { data: treasury } = useReadContract({
    address: CONTRACTS.DomainRentalVault,
    abi: DOMAIN_RENTAL_VAULT_ABI,
    functionName: 'treasury',
  })

  // Get listing by ID - returns a function to get listing data
  const getListing = useCallback((listingId: number) => {
    // This returns a configuration object that can be used with useReadContract externally
    return {
      address: CONTRACTS.DomainRentalVault,
      abi: DOMAIN_RENTAL_VAULT_ABI,
      functionName: 'getListing' as const,
      args: [BigInt(listingId)],
    }
  }, [])

  // Get rental by ID - returns a function to get rental data
  const getRental = useCallback((listingId: number) => {
    // This returns a configuration object that can be used with useReadContract externally
    return {
      address: CONTRACTS.DomainRentalVault,
      abi: DOMAIN_RENTAL_VAULT_ABI,
      functionName: 'getRental' as const,
      args: [BigInt(listingId)],
    }
  }, [])

  // Calculate rental cost
  const calculateRentalCost = useCallback(async (listing: RentalListing, days: number) => {
    if (!feeBps || typeof feeBps !== 'number') return null

    const rentalFee = listing.pricePerDay * BigInt(days)
    const protocolFee = (rentalFee * BigInt(feeBps)) / BigInt(10000)
    const securityDeposit = listing.securityDeposit
    const totalPayment = rentalFee + securityDeposit
    const ownerReceives = rentalFee - protocolFee

    return {
      rentalFee,
      protocolFee,
      securityDeposit,
      totalPayment,
      ownerReceives
    }
  }, [feeBps])

  // Write functions
  
  // 1. Approve NFT for vault
  const approveNFT = useCallback(async (nftContract: `0x${string}`, tokenId: bigint) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setCurrentAction('approve-nft')
      
      writeContract({
        address: nftContract,
        abi: DOMAIN_NFT_ABI,
        functionName: 'approve',
        args: [CONTRACTS.DomainRentalVault, tokenId],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // 2. Deposit NFT to create listing
  const deposit = useCallback(async (nftContract: `0x${string}`, tokenId: bigint) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setCurrentAction('deposit')
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'deposit',
        args: [nftContract, tokenId],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // 3. Set rental terms
  const setTerms = useCallback(async (
    listingId: number,
    pricePerDay: string, // in USDC (e.g., "10.5")
    securityDeposit: string, // in USDC (e.g., "50.0")
    minDays: number,
    maxDays: number,
    paymentToken: `0x${string}` = CONTRACTS.USDC
  ) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setCurrentAction('set-terms')
      
      // Convert USDC amounts to wei (6 decimals)
      const pricePerDayWei = parseUnits(pricePerDay, 6)
      const securityDepositWei = parseUnits(securityDeposit, 6)
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'setTerms',
        args: [
          BigInt(listingId),
          pricePerDayWei,
          securityDepositWei,
          minDays,
          maxDays,
          paymentToken
        ],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // 4. Approve USDC for rental payments
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

  // 5. Rent domain
  const rent = useCallback(async (listingId: number, days: number) => {
    if (!address) {
      throw new Error('Wallet not connected')
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

  // 6. Pause/unpause listing
  const pause = useCallback(async (listingId: number, paused: boolean) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setCurrentAction('pause')
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'pause',
        args: [BigInt(listingId), paused],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // 7. Unlist domain (remove from rental)
  const unlist = useCallback(async (listingId: number) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setCurrentAction('unlist')
      
      writeContract({
        address: CONTRACTS.DomainRentalVault,
        abi: DOMAIN_RENTAL_VAULT_ABI,
        functionName: 'unlist',
        args: [BigInt(listingId)],
      })
    } catch (error) {
      setCurrentAction(null)
      throw error
    }
  }, [address, writeContract])

  // 8. Extend rental
  const extend = useCallback(async (listingId: number, extraDays: number) => {
    if (!address) {
      throw new Error('Wallet not connected')
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

  // 9. End rental (cleanup expired rental)
  const endRent = useCallback(async (listingId: number) => {
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

  // 10. Claim deposit
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

  // Helper functions for status checking
  const isAvailable = useCallback((listing: RentalListing, rental: RentalInfo) => {
    return listing.nft !== '0x0000000000000000000000000000000000000000' && 
           !listing.paused && 
           rental.user === '0x0000000000000000000000000000000000000000'
  }, [])

  const isActiveRental = useCallback((rental: RentalInfo) => {
    return rental.user !== '0x0000000000000000000000000000000000000000' && 
           Date.now() / 1000 < Number(rental.expires)
  }, [])

  const isExpired = useCallback((rental: RentalInfo) => {
    return Number(rental.expires) > 0 && Date.now() / 1000 >= Number(rental.expires)
  }, [])

  return {
    // State
    currentAction,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: writeError || receiptError,

    // Contract data
    nextId: Number(nextId || 0),
    feeBps: Number(feeBps || 0),
    treasury,

    // Read functions
    getListing,
    getRental,
    calculateRentalCost,

    // Write functions
    approveNFT,
    deposit,
    setTerms,
    approveUSDC,
    rent,
    pause,
    unlist,
    extend,
    endRent,
    claimDeposit,

    // Utility functions
    resetAction,
    isAvailable,
    isActiveRental,
    isExpired,
  }
}