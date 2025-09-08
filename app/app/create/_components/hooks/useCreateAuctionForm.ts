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
  startPrice: string | number
  endPrice?: string | number
  minBid?: string | number
  reservePrice: string | number
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
    startPrice: '',
    reservePrice: '',
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
  const [domainSearchResult, setDomainSearchResult] = useState<Domain | null>(null)
  const [searchingDomain, setSearchingDomain] = useState(false)
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null)
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

  // Auto-set start time with WIB timezone for all auction types
  useEffect(() => {
    // Get current time in WIB (UTC+7)
    const now = new Date()
    const wibOffset = 7 * 60 * 60 * 1000 // WIB is UTC+7
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000) // Convert to UTC
    const wibTime = new Date(utcTime + wibOffset) // Convert to WIB
    
    // Add 5 minutes buffer to allow for form completion and transaction processing
    const startTime = new Date(wibTime.getTime() + (5 * 60 * 1000))
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    // We need to format this as if it's in the user's local timezone for the input
    const year = startTime.getFullYear()
    const month = String(startTime.getMonth() + 1).padStart(2, '0')
    const day = String(startTime.getDate()).padStart(2, '0')
    const hours = String(startTime.getHours()).padStart(2, '0')
    const minutes = String(startTime.getMinutes()).padStart(2, '0')
    const startTimeISO = `${year}-${month}-${day}T${hours}:${minutes}`
    
    setField('startTime', startTimeISO)
    console.log(`🕒 Auto-set start time for ${formData.auctionType} auction (WIB):`, startTimeISO, 'WIB time:', startTime.toLocaleString())
    
    // Auction-specific defaults
    if (formData.auctionType === 'sealed') {
      // Set default commit window if not set
      if (!formData.commitWindow) {
        setField('commitWindow', 1) // 1 hour default
        console.log('⏱️ Auto-set default commit window: 1 hour')
      }
      
      // Set default reveal window if not set  
      if (!formData.revealWindow) {
        setField('revealWindow', 1) // 1 hour default
        console.log('⏱️ Auto-set default reveal window: 1 hour')
      }
      
      // Set default minimum bid if not set
      if (!formData.minBid) {
        setField('minBid', '0.0001') // 0.0001 ETH default
        console.log('💰 Auto-set default minimum bid: 0.0001 ETH')
      }
    }
    
    if (formData.auctionType === 'english') {
      // Set default minimum increment if not set
      if (!formData.minIncrement) {
        setField('minIncrement', 5) // 5% default increment
        console.log('📈 Auto-set default minimum increment: 5%')
      }
    }
    
    if (formData.auctionType === 'dutch') {
      // Set default decay interval if not set
      if (!formData.decayInterval) {
        setField('decayInterval', 60) // 60 minutes default
        console.log('⏰ Auto-set default decay interval: 60 minutes')
      }
    }
  }, [formData.auctionType])

  // Auto-calculate end time when start time or durations change for sealed bid auctions
  useEffect(() => {
    if (formData.auctionType === 'sealed' && formData.startTime) {
      const commitHours = parseNumericValue(formData.commitWindow || '')
      const revealHours = parseNumericValue(formData.revealWindow || '')
      
      if (commitHours > 0 && revealHours > 0) {
        // Parse the start time as if it's in WIB timezone
        const startTime = new Date(formData.startTime)
        const totalHours = commitHours + revealHours
        const calculatedEndTime = new Date(startTime.getTime() + (totalHours * 60 * 60 * 1000))
        
        // Format end time for datetime-local input (same format as start time)
        const year = calculatedEndTime.getFullYear()
        const month = String(calculatedEndTime.getMonth() + 1).padStart(2, '0')
        const day = String(calculatedEndTime.getDate()).padStart(2, '0')
        const hours = String(calculatedEndTime.getHours()).padStart(2, '0')
        const minutes = String(calculatedEndTime.getMinutes()).padStart(2, '0')
        const endTimeISO = `${year}-${month}-${day}T${hours}:${minutes}`
        
        if (formData.endTime !== endTimeISO) {
          setField('endTime', endTimeISO)
          console.log('🧮 Auto-calculated end time (WIB):', endTimeISO, `(+${totalHours.toFixed(1)}h)`)
          console.log('Debug - Start time:', startTime.toLocaleString(), 'End time:', calculatedEndTime.toLocaleString())
        }
      }
    }
  }, [formData.auctionType, formData.startTime, formData.commitWindow, formData.revealWindow])

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
        tokenId: BigInt(formData.tokenId!),
        reservePrice: formData.reservePrice.toString(),
        duration,
        auctionType: formData.auctionType,
        startPrice: formData.startPrice && parseNumericValue(formData.startPrice) > 0 ? formData.startPrice.toString() : formData.reservePrice.toString(),
        endPrice: formData.endPrice && parseNumericValue(formData.endPrice) > 0 ? formData.endPrice.toString() : '0.1',
        incrementBps: formData.minIncrement ? Math.floor(formData.minIncrement * 100) : 500,
        antiSnipingEnabled: true,
        isLinear: true,
        commitDuration: formData.commitWindow && formData.commitWindow > 0 ? Math.max(Math.floor(formData.commitWindow * 3600), 300) : 3600,
        revealDuration: formData.revealWindow && formData.revealWindow > 0 ? Math.max(Math.floor(formData.revealWindow * 3600), 300) : 3600,
        minimumDeposit: formData.minBid && parseNumericValue(formData.minBid) > 0 ? formData.minBid.toString() : '0.01',
        isWhitelisted: false,
        whitelist: []
      }
      
      console.log('🔧 Sealed bid durations (converted to seconds):', {
        commitDurationHours: formData.commitWindow,
        revealDurationHours: formData.revealWindow,
        commitDurationSeconds: formData.commitWindow && formData.commitWindow > 0 ? Math.max(Math.floor(formData.commitWindow * 3600), 300) : 3600,
        revealDurationSeconds: formData.revealWindow && formData.revealWindow > 0 ? Math.max(Math.floor(formData.revealWindow * 3600), 300) : 3600,
        totalDurationSeconds: duration
      })
      
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
  
  // Fix: Add toNum function that was missing
  const toNum = (v: string): number => {
    const num = Number(v)
    return isNaN(num) ? 0 : num
  }
  
  // Allow string input for decimal values, convert to number only when needed
  const parseNumericValue = (v: string | number): number => {
    if (typeof v === 'number') return v
    if (v === '' || isNaN(Number(v))) return 0
    return Number(v)
  }

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
    setDomainSearchResult(null) // Clear search result when selecting from owned domains
  }

  // Search domain function for manual entry
  async function searchDomainByName(domainName: string) {
    if (!domainName.trim()) {
      setDomainSearchResult(null)
      return
    }

    setSearchingDomain(true)
    try {
      const searchTerm = domainName.toLowerCase()
      console.log('🔍 Searching domains with term:', searchTerm)
      
      // Search in user's owned domains (partial match)
      const matchingDomains = myDomains.filter(domain => 
        domain.name.toLowerCase().includes(searchTerm)
      )
      
      console.log('📊 Found matching domains:', matchingDomains)
      
      if (matchingDomains.length > 0) {
        // If exact match exists, prioritize it
        const exactMatch = matchingDomains.find(d => d.name.toLowerCase() === searchTerm)
        const bestMatch = exactMatch || matchingDomains[0]
        
        console.log('✅ Best match found:', bestMatch)
        setDomainSearchResult(bestMatch)
        setSearchingDomain(false)
        return
      }

      // If no matches found in owned domains, create manual entry placeholder
      console.log('📝 No matches found, creating manual entry for:', domainName)
      const manualDomain: Domain = {
        id: `manual-${Date.now()}`,
        name: domainName,
        tld: domainName.includes('.') ? `.${domainName.split('.').pop()}` : '.eth',
        expiresAt: undefined,
        tokenAddress: '',
        tokenId: '',
        tokenChain: '',
      }
      
      setDomainSearchResult(manualDomain)
    } catch (error) {
      console.error('Error searching domain:', error)
      setDomainSearchResult(null)
    } finally {
      setSearchingDomain(false)
    }
  }

  // Handle manual domain input with debounce
  function handleManualDomainInput(value: string) {
    console.log('🔍 Manual domain input:', value)
    setField('domain', value)
    
    // Clear previous timeout
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout)
    }

    // Set new timeout for search
    const newTimeout = setTimeout(() => {
      searchDomainByName(value)
    }, 300) // 300ms debounce for faster feedback
    
    setSearchDebounceTimeout(newTimeout)
  }

  // Select searched domain
  function selectSearchedDomain(domain: Domain) {
    console.log('✅ Selecting searched domain:', domain)
    setFormData((p) => ({
      ...p,
      domainId: domain.id,
      domain: domain.name,
      tokenAddress: domain.tokenAddress || '',
      tokenId: domain.tokenId || '',
      tokenChain: domain.tokenChain || '',
    }))
    setDomainSearchResult(null)
    console.log('✅ Domain selected, form should now be valid')
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
      
      // For sealed bid auctions, end time is auto-calculated, just validate start time
      if (formData.auctionType === 'sealed') {
        // End time validation not needed since it's auto-calculated
        // Start time validation still needed
        if (formData.startTime && new Date(formData.startTime) <= new Date()) {
          e.startTime = 'Start time must be in the future.'
        }
      } else {
        // For other auction types, validate end time manually
        if (!formData.endTime) e.endTime = 'End time is required.'
        if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
          e.endTime = 'End time must be after start time.'
        }
      }

      if (formData.auctionType === 'english') {
        const minIncrement = parseNumericValue(formData.minIncrement || '')
        if (!formData.minIncrement || minIncrement <= 0) e.minIncrement = 'Minimum increment must be > 0.'
      }

      if (formData.auctionType === 'dutch') {
        const startPrice = parseNumericValue(formData.startPrice || '')
        const endPrice = parseNumericValue(formData.endPrice || '')
        const reservePrice = parseNumericValue(formData.reservePrice || '')
        
        if (!formData.startPrice || startPrice <= 0) e.startPrice = 'Start price must be > 0.'
        if (!formData.endPrice || endPrice <= 0) e.endPrice = 'End price must be > 0.'
        if (endPrice >= startPrice) e.endPrice = 'End price should be lower than start price.'
        
        // Validate that startPrice > reservePrice if reserve price is set
        if (reservePrice > 0 && startPrice > 0 && startPrice <= reservePrice) {
          e.startPrice = 'Start price must be greater than reserve price.'
        }
        
        if (!formData.decayInterval || formData.decayInterval <= 0) e.decayInterval = 'Decay interval must be > 0.'
      }

      if (formData.auctionType === 'sealed') {
        const minBid = parseNumericValue(formData.minBid || '')
        const commitHours = parseNumericValue(formData.commitWindow || '')
        const revealHours = parseNumericValue(formData.revealWindow || '')
        
        if (!formData.minBid || minBid <= 0) e.minBid = 'Minimum bid must be > 0.'
        
        // Validate commit window
        if (!formData.commitWindow || commitHours <= 0) {
          e.commitWindow = 'Commit window must be > 0 hours.'
        } else if (commitHours < 0.083) { // Less than 5 minutes (0.083 hours)
          e.commitWindow = 'Commit window must be at least 5 minutes (0.083 hours).'
        } else if (commitHours > 168) { // More than 7 days
          e.commitWindow = 'Commit window cannot exceed 7 days (168 hours).'
        }
        
        // Validate reveal window  
        if (!formData.revealWindow || revealHours <= 0) {
          e.revealWindow = 'Reveal window must be > 0 hours.'
        } else if (revealHours < 0.083) { // Less than 5 minutes
          e.revealWindow = 'Reveal window must be at least 5 minutes (0.083 hours).'
        } else if (revealHours > 168) { // More than 7 days
          e.revealWindow = 'Reveal window cannot exceed 7 days (168 hours).'
        }
        
        // Validate total duration
        const totalHours = commitHours + revealHours
        if (totalHours > 720) { // More than 30 days
          e.commitWindow = 'Combined commit + reveal duration cannot exceed 30 days.'
        }
      }
    }

    if (step === 'reserve') {
      const reservePrice = parseNumericValue(formData.reservePrice)
      if (reservePrice < 0) e.reservePrice = 'Reserve price cannot be negative.'
      
      // For Dutch auctions, validate that startPrice > reservePrice
      if (formData.auctionType === 'dutch') {
        const startPrice = parseNumericValue(formData.startPrice || '')
        if (startPrice > 0 && reservePrice > 0 && startPrice <= reservePrice) {
          e.reservePrice = 'Reserve price must be lower than start price for Dutch auctions.'
        }
      }
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
        tokenId: BigInt(formData.tokenId!),
        reservePrice: formData.reservePrice.toString(),
        duration,
        auctionType: formData.auctionType,
        startPrice: formData.startPrice && parseNumericValue(formData.startPrice) > 0 ? formData.startPrice.toString() : formData.reservePrice.toString(),
        endPrice: formData.endPrice && parseNumericValue(formData.endPrice) > 0 ? formData.endPrice.toString() : '0.1',
        incrementBps: formData.minIncrement ? Math.floor(formData.minIncrement * 100) : 500,
        antiSnipingEnabled: true,
        isLinear: true,
        commitDuration: formData.commitWindow && formData.commitWindow > 0 ? Math.max(Math.floor(formData.commitWindow * 3600), 300) : 3600,
        revealDuration: formData.revealWindow && formData.revealWindow > 0 ? Math.max(Math.floor(formData.revealWindow * 3600), 300) : 3600,
        minimumDeposit: formData.minBid && parseNumericValue(formData.minBid) > 0 ? formData.minBid.toString() : '0.01',
        isWhitelisted: false,
        whitelist: []
      }

      console.log('🔧 Sealed bid durations (converted to seconds):', {
        commitDurationHours: formData.commitWindow,
        revealDurationHours: formData.revealWindow,
        commitDurationSeconds: formData.commitWindow && formData.commitWindow > 0 ? Math.max(Math.floor(formData.commitWindow * 3600), 300) : 3600,
        revealDurationSeconds: formData.revealWindow && formData.revealWindow > 0 ? Math.max(Math.floor(formData.revealWindow * 3600), 300) : 3600,
        totalDurationSeconds: duration
      })
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
      startPrice: '',
      reservePrice: '',
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
      // Domain search functionality
      domainSearchResult,
      searchingDomain,
      handleManualDomainInput,
      selectSearchedDomain,
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
