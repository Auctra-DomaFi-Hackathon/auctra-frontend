'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRentalVault } from '@/hooks/useRentalVault'
import { CONTRACTS } from '@/hooks/contracts/constants'
import { toast } from '@/hooks/use-toast'

type FlowStep = 'idle' | 'approve-nft' | 'deposit' | 'set-terms' | 'completed' | 'error'

interface CreateRentalFlowData {
  nftAddress: string
  tokenId: string
  pricePerDay: string
  securityDeposit: string
  minDays: number
  maxDays: number
}

export function useCreateRentalFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('idle')
  const [listingId, setListingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const rentalVault = useRentalVault()

  // Reset flow
  const resetFlow = useCallback(() => {
    setCurrentStep('idle')
    setListingId(null)
    setError(null)
    rentalVault.resetAction()
  }, [rentalVault])

  // Handle transaction confirmations
  useEffect(() => {
    if (rentalVault.isConfirmed && rentalVault.hash) {
      const action = rentalVault.currentAction
      
      if (action === 'approve-nft') {
        setCurrentStep('deposit')
        toast({
          title: 'NFT Approved',
          description: 'NFT approval successful. Now depositing to vault...',
        })
      } else if (action === 'deposit') {
        // Get the new listing ID from nextId - 1
        const newListingId = rentalVault.nextId - 1
        setListingId(newListingId)
        setCurrentStep('set-terms')
        toast({
          title: 'NFT Deposited',
          description: `NFT deposited successfully. Listing ID: ${newListingId}`,
        })
      } else if (action === 'set-terms') {
        setCurrentStep('completed')
        toast({
          title: 'Rental Listing Created!',
          description: 'Your rental listing has been created successfully!',
          duration: 5000,
        })
      }
    }
  }, [rentalVault.isConfirmed, rentalVault.hash, rentalVault.currentAction, rentalVault.nextId])

  // Handle errors
  useEffect(() => {
    if (rentalVault.error) {
      setCurrentStep('error')
      setError(rentalVault.error.message)
      toast({
        title: 'Transaction Failed',
        description: rentalVault.error.message,
        variant: 'destructive',
      })
    }
  }, [rentalVault.error])

  // Start the rental creation flow
  const startFlow = useCallback(async (data: CreateRentalFlowData) => {
    try {
      resetFlow()
      setCurrentStep('approve-nft')
      
      // Step 1: Approve NFT
      await rentalVault.approveNFT(
        data.nftAddress as `0x${string}`,
        BigInt(data.tokenId)
      )
    } catch (err) {
      setCurrentStep('error')
      setError(err instanceof Error ? err.message : 'Failed to start rental creation flow')
    }
  }, [rentalVault, resetFlow])

  // Continue flow after approval (called automatically via useEffect)
  const continueWithDeposit = useCallback(async (data: CreateRentalFlowData) => {
    try {
      await rentalVault.deposit(
        data.nftAddress as `0x${string}`,
        BigInt(data.tokenId)
      )
    } catch (err) {
      setCurrentStep('error')
      setError(err instanceof Error ? err.message : 'Failed to deposit NFT')
    }
  }, [rentalVault])

  // Continue with setting terms (called automatically via useEffect)
  const continueWithTerms = useCallback(async (data: CreateRentalFlowData) => {
    if (!listingId) {
      setError('Listing ID not found')
      setCurrentStep('error')
      return
    }

    try {
      await rentalVault.setTerms(
        listingId,
        data.pricePerDay,
        data.securityDeposit,
        data.minDays,
        data.maxDays,
        CONTRACTS.USDC
      )
    } catch (err) {
      setCurrentStep('error')
      setError(err instanceof Error ? err.message : 'Failed to set rental terms')
    }
  }, [rentalVault, listingId])

  // Auto-continue flow based on current step
  const continueFlow = useCallback((data: CreateRentalFlowData) => {
    if (currentStep === 'deposit' && rentalVault.currentAction !== 'deposit') {
      continueWithDeposit(data)
    } else if (currentStep === 'set-terms' && rentalVault.currentAction !== 'set-terms') {
      continueWithTerms(data)
    }
  }, [currentStep, rentalVault.currentAction, continueWithDeposit, continueWithTerms])

  // Get step description
  const getStepDescription = useCallback(() => {
    switch (currentStep) {
      case 'approve-nft':
        return 'Approving NFT for rental vault...'
      case 'deposit':
        return 'Depositing NFT to create listing...'
      case 'set-terms':
        return 'Setting rental terms...'
      case 'completed':
        return 'Rental listing created successfully!'
      case 'error':
        return error || 'An error occurred'
      default:
        return 'Ready to create rental listing'
    }
  }, [currentStep, error])

  // Check if flow is in progress
  const isInProgress = currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'error'
  const isCompleted = currentStep === 'completed'
  const hasError = currentStep === 'error'

  return {
    // State
    currentStep,
    listingId,
    error,
    isInProgress,
    isCompleted,
    hasError,
    
    // Contract state
    isPending: rentalVault.isPending,
    isConfirming: rentalVault.isConfirming,
    hash: rentalVault.hash,

    // Actions
    startFlow,
    continueFlow,
    resetFlow,
    
    // Helpers
    getStepDescription,
  }
}