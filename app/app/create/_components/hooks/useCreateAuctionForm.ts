'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useMyDomains } from '@/lib/graphql/hooks'
import type { Domain } from '@/types'
import { useStepper } from './useStepper'
import { useWallet } from '@/hooks/useWallet'
import { useDomains, useApproveDomain, useCheckApproval } from '@/hooks/useDomains'
import { useCreateAuction } from '@/hooks/useAuction'

export type AuctionKind = 'english' | 'dutch' | 'sealed'

export interface AuctionFormData {
  domainId: string
  domain: string
  tokenAddress?: string
  tokenId?: string
  tokenChain?: string
  auctionType: AuctionKind
  startPrice: number
  endPrice?: number
  minBid?: number
  reservePrice: number
  decayInterval?: number
  minIncrement?: number
  commitWindow?: number
  revealWindow?: number
  startTime: string
  endTime: string
  autoListing: boolean
}

export function useCreateAuctionForm() {
  const router = useRouter()
  const { address } = useAccount()
  
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<AuctionFormData>({
    domainId: '',
    domain: '',
    tokenAddress: '',
    tokenId: '',
    tokenChain: '',
    auctionType: 'english', // Default to English auction
    startPrice: 0,
    reservePrice: 0,
    startTime: '',
    endTime: '',
    autoListing: false,
  })

  // Web3 hooks
  const wallet = useWallet()
  const { domains: blockchainDomains, loading: domainsLoading } = useDomains(address)
  const { approveDomain, isPending: isApproving, isConfirming: isApprovalConfirming, isSuccess: isApproved, error: approvalError } = useApproveDomain()
  const { 
    createAuction, 
    setCriteria, 
    chooseStrategy, 
    goLive,
    currentStep: auctionStep, 
    isPending: isCreatingAuction, 
    listingId,
    isListSuccess,
    isCriteriaSuccess, 
    isStrategySuccess,
    isStartSuccess,
    listHash,
    criteriaHash,
    strategyHash,
    startHash,
  } = useCreateAuction()
  
  // Get approval status for selected domain
  const selectedTokenId = formData.tokenId ? BigInt(formData.tokenId) : undefined
  const { isApproved: currentApproval } = useCheckApproval(selectedTokenId)
  
  // Fetch domains from GraphQL (keeping for backward compatibility)
  const {
    domains: graphqlDomains,
    loading: graphqlLoading,
  } = useMyDomains(address)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestedReserve, setSuggestedReserve] = useState<{ reserve: number; rationale: string[] } | null>(null)
  const [busy, setBusy] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionHashes, setTransactionHashes] = useState<{
    list?: string
    criteria?: string
    strategy?: string
    goLive?: string
  }>({})

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Handle approval errors - if approval fails, try to continue anyway
  useEffect(() => {
    if (approvalError && busy) {
      console.warn('Approval failed, attempting to continue with auction creation anyway:', approvalError)
      // Small delay then continue with auction creation
      const timer = setTimeout(() => {
        if (busy && formData.tokenId) {
          console.log('Skipping approval, proceeding with auction creation...')
          handleSubmit()
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalError, busy, formData.tokenId])

  // Auto-continue auction creation after approval succeeds
  useEffect(() => {
    if (isApproved && busy && formData.tokenId && !isApproving && !isApprovalConfirming) {
      console.log('Domain approved! Proceeding with auction creation...')
      // Give time for approval transaction to finalize
      const timer = setTimeout(() => {
        if (busy) {
          continueAuctionCreation()
        }
      }, 5000) // 5 seconds delay
      
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproved, busy, formData.tokenId, isApproving, isApprovalConfirming])
  
  // Continue with remaining steps once we have the real listingId
  useEffect(() => {
    if (listingId && busy && isListSuccess && auctionStep === 'list') {
      console.log('Real listingId obtained:', listingId.toString(), 'executing remaining steps...')
      
      const startTime = new Date(formData.startTime).getTime()
      const endTime = new Date(formData.endTime).getTime()
      const duration = Math.floor((endTime - startTime) / 1000)

      const auctionParams = {
        tokenId: BigInt(formData.tokenId),
        reservePrice: formData.reservePrice.toString(),
        duration,
        auctionType: formData.auctionType,
        startPrice: formData.startPrice?.toString(),
        endPrice: formData.endPrice?.toString(),
        incrementBps: formData.minIncrement ? Math.floor(formData.minIncrement * 100) : 500,
        antiSnipingEnabled: true,
        isLinear: true,
        commitDuration: formData.commitWindow,
        revealDuration: formData.revealWindow,
        minimumDeposit: formData.minBid?.toString() || '0.01',
        isWhitelisted: false,
        whitelist: []
      }
      
      const timer = setTimeout(() => {
        if (busy && listingId) {
          executeAllAuctionSteps(auctionParams, listingId)
        }
      }, 2000) // Small delay to ensure transaction is fully processed
      
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, busy, isListSuccess, auctionStep])

  // Combine blockchain domains with GraphQL domains
  const myDomains = useMemo((): Domain[] => {
    const domains: Domain[] = []
    
    // Add blockchain domains (preferred)
    if (blockchainDomains && blockchainDomains.length > 0) {
      domains.push(...blockchainDomains.map((domain) => ({
        id: `blockchain-${domain.tokenId.toString()}`,
        name: domain.domainName,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Default 1 year
        verified: true,
        tokenAddress: '', // Will be filled from constants
        tokenId: domain.tokenId.toString(),
        tokenChain: 'doma-testnet',
      })))
    }
    
    // Add GraphQL domains as fallback
    if (graphqlDomains && graphqlDomains.length > 0) {
      const graphqlMapped = graphqlDomains.map((domain, index) => ({
        id: `graphql-${index}`,
        name: domain.name,
        expiresAt: domain.expiresAt,
        verified: true,
        tokenAddress: domain.tokenAddress,
        tokenId: domain.tokenId,
        tokenChain: domain.tokenChain,
      }))
      
      // Only add GraphQL domains that are not already in blockchain domains
      const blockchainNames = new Set(domains.map(d => d.name))
      domains.push(...graphqlMapped.filter(d => !blockchainNames.has(d.name)))
    }
    
    return domains
  }, [blockchainDomains, graphqlDomains])

  // Update loading state to include domains loading
  const isLoading = loading || (address && (domainsLoading || graphqlLoading))

  const steps = [
    { id: 'domain', label: 'Domain', icon: 'BadgeCheck' },
    { id: 'type', label: 'Auction', icon: 'Info' },
    { id: 'config', label: 'Configuration', icon: 'SlidersHorizontal' },
    { id: 'reserve', label: 'Price', icon: 'DollarSign' },
    { id: 'preview', label: 'Preview', icon: 'CheckCircle2' },
  ] as const

  const { currentStep, setCurrentStep, isCompleted, currentIndex } = useStepper(steps)

  const nowISO = useMemo(() => new Date().toISOString().slice(0, 16), [])
  const hasDomain = !!formData.domain?.trim()
  const toNum = (v: string) => (v === '' || isNaN(Number(v)) ? 0 : Number(v))

  function setField<K extends keyof AuctionFormData>(key: K, value: AuctionFormData[K]) {
    setFormData((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key as string]: '' }))
  }

  function handleDomainSelect(domain: Domain) {
    setFormData((p) => ({
      ...p,
      domainId: domain.id,
      domain: domain.name,
      tokenAddress: domain.tokenAddress || '',
      tokenId: domain.tokenId || '',
      tokenChain: domain.tokenChain || '',
    }))
  }

  async function handleSuggestReserve() {
    if (!formData.domain) return
    try {
      const res = await fetch(`/api/oracle/suggest?domain=${encodeURIComponent(formData.domain)}`)
      const data = await res.json()
      setSuggestedReserve(data)
      setField('reservePrice', data.reserve)
    } catch (e) {
      console.error('Failed to get reserve suggestion:', e)
    }
  }

  function validateStep(step: typeof steps[number]['id']): boolean {
    const e: Record<string, string> = {}

    if (step === 'domain') {
      if (!formData.domain.trim()) e.domain = 'Please select or input a domain.'
    }

    if (step === 'type') {
      if (!['english', 'dutch', 'sealed'].includes(formData.auctionType)) e.auctionType = 'Please choose a valid auction type.'
    }

    if (step === 'config') {
      if (!formData.startTime) e.startTime = 'Start time is required.'
      if (!formData.endTime) e.endTime = 'End time is required.'
      if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
        e.endTime = 'End time must be after start time.'
      }

      if (formData.auctionType === 'english') {
        if (!formData.minIncrement || formData.minIncrement <= 0) e.minIncrement = 'Minimum increment must be > 0.'
      }

      if (formData.auctionType === 'dutch') {
        if (!formData.startPrice || formData.startPrice <= 0) e.startPrice = 'Start price must be > 0.'
        if (!formData.endPrice || formData.endPrice <= 0) e.endPrice = 'End price must be > 0.'
        if ((formData.endPrice ?? 0) >= formData.startPrice) e.endPrice = 'End price should be lower than start price.'
        if (!formData.decayInterval || formData.decayInterval <= 0) e.decayInterval = 'Decay interval must be > 0.'
      }

      if (formData.auctionType === 'sealed') {
        if (!formData.minBid || formData.minBid <= 0) e.minBid = 'Minimum bid must be > 0.'
        if (!formData.commitWindow || formData.commitWindow <= 0) e.commitWindow = 'Commit window must be > 0.'
        if (!formData.revealWindow || formData.revealWindow <= 0) e.revealWindow = 'Reveal window must be > 0.'
      }
    }

    if (step === 'reserve') {
      if (formData.reservePrice < 0) e.reservePrice = 'Reserve price cannot be negative.'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next(target: typeof steps[number]['id']) {
    if (!validateStep(currentStep)) return
    setCurrentStep(target)
  }

  const continueAuctionCreation = async () => {
    try {
      // Calculate auction duration in seconds
      const startTime = new Date(formData.startTime).getTime()
      const endTime = new Date(formData.endTime).getTime()
      const duration = Math.floor((endTime - startTime) / 1000)

      // Create auction parameters
      const auctionParams = {
        tokenId: BigInt(formData.tokenId),
        reservePrice: formData.reservePrice.toString(),
        duration,
        auctionType: formData.auctionType,
        startPrice: formData.startPrice?.toString(),
        endPrice: formData.endPrice?.toString(),
        incrementBps: formData.minIncrement ? Math.floor(formData.minIncrement * 100) : 500,
        antiSnipingEnabled: true,
        isLinear: true,
        commitDuration: formData.commitWindow,
        revealDuration: formData.revealWindow,
        minimumDeposit: formData.minBid?.toString() || '0.01',
        isWhitelisted: false,
        whitelist: []
      }

      console.log('Creating auction with params:', auctionParams)
      
      // Start with listing - this will trigger listingId extraction via useEffect
      await createAuction(auctionParams)
      
      console.log('List transaction submitted, waiting for confirmation and listingId extraction...')
      
    } catch (e) {
      console.error('Failed to continue auction creation:', e)
      setErrors({ 
        submit: e instanceof Error ? e.message : 'Failed to create auction. Please try again.' 
      })
      setBusy(false)
    }
  }
  
  const executeAllAuctionSteps = async (auctionParams: any, newListingId: bigint) => {
    try {
      console.log('Starting sequential auction creation process...')
      
      console.log('Step 2: Setting criteria for listing:', newListingId.toString())
      setCriteria(auctionParams, newListingId)
      
      // Wait longer for user to confirm in wallet and transaction to process
      console.log('Waiting for criteria transaction...')
      await new Promise(resolve => setTimeout(resolve, 15000)) // 15 seconds
      
      console.log('Step 3: Choosing strategy for listing:', newListingId.toString())
      chooseStrategy(auctionParams, newListingId)
      
      // Wait for strategy transaction
      console.log('Waiting for strategy transaction...')
      await new Promise(resolve => setTimeout(resolve, 15000)) // 15 seconds
      
      console.log('Step 4: Going live for listing:', newListingId.toString())
      goLive(auctionParams, newListingId)
      
      // Wait for go live transaction
      console.log('Waiting for go live transaction...')
      await new Promise(resolve => setTimeout(resolve, 15000)) // 15 seconds
      
      // Collect transaction hashes
      const hashes: any = {}
      if (listHash) hashes.list = listHash
      if (criteriaHash) hashes.criteria = criteriaHash
      if (strategyHash) hashes.strategy = strategyHash
      if (startHash) hashes.goLive = startHash
      
      // Show success modal - don't reset form yet!
      console.log('All auction steps completed! Transaction hashes:', hashes)
      setTransactionHashes(hashes)
      setShowSuccessModal(true)
      setBusy(false)
      
    } catch (e) {
      console.error('Failed to execute auction steps:', e)
      setErrors({ 
        submit: e instanceof Error ? e.message : 'Failed to complete auction creation. Please try again.' 
      })
      setBusy(false)
    }
  }
  
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    
    // Only reset form after user closes modal
    setFormData({
      domainId: '',
      domain: '',
      tokenAddress: '',
      tokenId: '',
      tokenChain: '',
      auctionType: 'english',
      startPrice: 0,
      reservePrice: 0,
      startTime: '',
      endTime: '',
      autoListing: false,
    })
    
    // Reset transaction hashes
    setTransactionHashes({})
    
    // Go back to domain selection step
    setCurrentStep('domain')
  }

  async function handleSubmit() {
    if (!validateStep('reserve')) {
      setCurrentStep('reserve')
      return
    }

    // Check if user is connected and on the right network
    if (!wallet.isConnected) {
      setErrors({ submit: 'Please connect your wallet first.' })
      return
    }

    if (!wallet.isOnDomaTestnet) {
      try {
        await wallet.switchToDomaTestnet()
      } catch (e) {
        setErrors({ submit: 'Please switch to Doma Testnet to create auctions.' })
        return
      }
    }

    setBusy(true)
    try {
      console.log('Creating auction:', formData)
      
      // Ensure we have the required tokenId
      if (!formData.tokenId) {
        throw new Error('Token ID is required to create auction')
      }

      // Try to approve domain first if not already approved
      if (!isApproved && selectedTokenId && !approvalError) {
        console.log('Approving domain for auction house...')
        try {
          approveDomain(selectedTokenId)
          // Return early to show approval pending state
          return
        } catch (approveError) {
          console.error('Approval failed:', approveError)
          // Continue anyway - maybe it's already approved or approval isn't needed
        }
      }

      // If approval is still pending, don't proceed yet
      if (isApproving || isApprovalConfirming) {
        console.log('Waiting for approval transaction to complete...')
        return
      }
      
      // If already approved, proceed directly
      if (isApproved || currentApproval) {
        await continueAuctionCreation()
      }
      
    } catch (e) {
      console.error('Failed to create auction:', e)
      setErrors({ 
        submit: e instanceof Error ? e.message : 'Failed to create auction. Please try again.' 
      })
      setBusy(false)
    }
  }

  return {
    loading: isLoading,
    currentStep,
    setCurrentStep,
    steps,
    // Wallet and blockchain state
    wallet,
    isApproving,
    isApproved,
    isCreatingAuction,
    auctionStep,
    listingId,
    stepperProps: { steps, currentStep, currentIndex, isCompleted },
    domainStepProps: {
      formData,
      errors,
      myDomains,
      hasDomain,
      handleDomainSelect,
      setField,
      next,
    },
    typeStepProps: {
      formData,
      errors,
      setField,
      next,
      back: () => setCurrentStep('domain'),
    },
    configStepProps: {
      formData,
      errors,
      setField,
      next,
      back: () => setCurrentStep('type'),
      toNum,
      nowISO,
    },
    reserveStepProps: {
      formData,
      errors,
      setField,
      next,
      back: () => setCurrentStep('config'),
      suggestedReserve,
      handleSuggestReserve,
      toNum,
    },
    previewStepProps: {
      formData,
      setCurrentStep,
      back: () => setCurrentStep('reserve'),
      busy: busy || isApproving || isApprovalConfirming || isCreatingAuction,
      handleSubmit,
      wallet,
      isApproving: isApproving || isApprovalConfirming,
      auctionStep,
      currentApproval,
      isApproved,
    },
    // Success modal props
    successModalProps: {
      isOpen: showSuccessModal,
      onClose: handleSuccessModalClose,
      listingId: listingId?.toString() || '',
      domain: formData.domain,
      auctionType: formData.auctionType,
      reservePrice: formData.reservePrice,
      transactionHashes,
    },
  }
}
