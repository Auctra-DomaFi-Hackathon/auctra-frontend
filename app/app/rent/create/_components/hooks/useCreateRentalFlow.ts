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
  const [flowData, setFlowData] = useState<CreateRentalFlowData | null>(null)
  
  const rentalVault = useRentalVault()

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
    // Use the nextId-1 to get the current listing ID
    const currentListingId = rentalVault.nextId - 1
    if (!currentListingId || currentListingId < 0) {
      setError('Listing ID not found')
      setCurrentStep('error')
      return
    }

    try {
      await rentalVault.setTerms(
        currentListingId,
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
  }, [rentalVault])

  // Reset flow
  const resetFlow = useCallback(() => {
    setCurrentStep('idle')
    setListingId(null)
    setError(null)
    setFlowData(null)
    rentalVault.resetAction()
  }, [rentalVault])

  // Handle transaction confirmations (manual steps now)
  useEffect(() => {
    if (rentalVault.isConfirmed && rentalVault.hash) {
      const action = rentalVault.currentAction
      
      if (action === 'approve-nft') {
        setCurrentStep('deposit')
        toast({
          title: 'NFT Approved Successfully!',
          description: 'You can now proceed to create the rental listing.',
        })
        
      } else if (action === 'deposit') {
        // Get the new listing ID from nextId - 1
        const newListingId = rentalVault.nextId - 1
        setListingId(newListingId)
        setCurrentStep('set-terms')
        toast({
          title: 'Rental Created Successfully!',
          description: `Listing ID: ${newListingId}. Now you can set the rental terms.`,
        })
        
      } else if (action === 'set-terms') {
        setCurrentStep('completed')
        toast({
          title: 'Rental Listing Completed!',
          description: 'Your rental listing is now live and available for rent!',
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

  // Start the rental creation flow (Step 1: Approve NFT)
  const startFlow = useCallback(async (data: CreateRentalFlowData) => {
    try {
      resetFlow()
      setFlowData(data) // Store flow data for later steps
      setCurrentStep('approve-nft')
      
      // Step 1: Approve NFT
      await rentalVault.approveNFT(
        data.nftAddress as `0x${string}`,
        BigInt(data.tokenId)
      )
    } catch (err) {
      setCurrentStep('error')
      setError(err instanceof Error ? err.message : 'Failed to approve NFT')
    }
  }, [rentalVault, resetFlow])

  // Step 2: Create Rental (Deposit NFT)
  const createRental = useCallback(async () => {
    if (!flowData) {
      setError('Flow data not found')
      setCurrentStep('error')
      return
    }

    try {
      await continueWithDeposit(flowData)
    } catch (err) {
      setCurrentStep('error')
      setError(err instanceof Error ? err.message : 'Failed to create rental')
    }
  }, [flowData, continueWithDeposit])

  // Step 3: Set Terms
  const setTerms = useCallback(async () => {
    if (!flowData) {
      setError('Flow data not found')
      setCurrentStep('error')
      return
    }

    try {
      await continueWithTerms(flowData)
    } catch (err) {
      setCurrentStep('error')
      setError(err instanceof Error ? err.message : 'Failed to set terms')
    }
  }, [flowData, continueWithTerms])

  // Manual continue flow (kept for backwards compatibility but not used internally)
  const continueFlow = useCallback((data: CreateRentalFlowData) => {
    // This is now handled automatically by the useEffect above
    // Kept for backwards compatibility with existing form component
    console.warn('continueFlow called - this is now handled automatically')
  }, [])

  // Get step description
  const getStepDescription = useCallback(() => {
    switch (currentStep) {
      case 'idle':
        return 'Ready to start creating your rental listing'
      case 'approve-nft':
        return 'Step 1: Approving NFT for rental vault...'
      case 'deposit':
        return 'Step 2: Ready to create rental listing'
      case 'set-terms':
        return 'Step 3: Ready to set rental terms'
      case 'completed':
        return 'All done! Your rental listing is now live!'
      case 'error':
        return error || 'An error occurred during the process'
      default:
        return 'Ready to create rental listing'
    }
  }, [currentStep, error])

  // Get current step number (1-3)
  const getCurrentStepNumber = useCallback(() => {
    switch (currentStep) {
      case 'idle':
        return 0
      case 'approve-nft':
        return 1
      case 'deposit':
        return 2
      case 'set-terms':
        return 3
      case 'completed':
        return 3
      case 'error':
        return 0
      default:
        return 0
    }
  }, [currentStep])

  // Check if step can be executed
  const canExecuteStep = useCallback((step: number) => {
    if (rentalVault.isPending || rentalVault.isConfirming) return false
    
    switch (step) {
      case 1: // Approve NFT
        return currentStep === 'idle' || currentStep === 'error'
      case 2: // Create Rental
        return currentStep === 'deposit'
      case 3: // Set Terms
        return currentStep === 'set-terms'
      default:
        return false
    }
  }, [currentStep, rentalVault.isPending, rentalVault.isConfirming])

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
    createRental,
    setTerms,
    continueFlow, // Deprecated but kept for compatibility
    resetFlow,
    
    // Helpers
    getStepDescription,
    getCurrentStepNumber,
    canExecuteStep,
  }
}