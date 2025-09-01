'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useMyDomains } from '@/lib/graphql/hooks'
import type { Domain } from '@/types'
import { useStepper } from './useStepper'

export type AuctionKind = 'sealed' | 'dutch'

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
  
  // Fetch domains from GraphQL
  const {
    domains: graphqlDomains,
    loading: domainsLoading,
    error: domainsError,
  } = useMyDomains(address)
  
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<AuctionFormData>({
    domainId: '',
    domain: '',
    tokenAddress: '',
    tokenId: '',
    tokenChain: '',
    auctionType: 'dutch',
    startPrice: 0,
    reservePrice: 0,
    startTime: '',
    endTime: '',
    autoListing: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestedReserve, setSuggestedReserve] = useState<{ reserve: number; rationale: string[] } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Transform GraphQL domains to Domain format compatible with existing component
  const myDomains = useMemo((): Domain[] => {
    if (graphqlDomains && graphqlDomains.length > 0) {
      return graphqlDomains.map((domain, index) => ({
        id: `domain-${index}`,
        name: domain.name,
        expiresAt: domain.expiresAt,
        verified: true,
        tokenAddress: domain.tokenAddress,
        tokenId: domain.tokenId,
        tokenChain: domain.tokenChain,
      }))
    }
    return []
  }, [graphqlDomains])

  // Update loading state to include domains loading
  const isLoading = loading || (address && domainsLoading)

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
      if (!['dutch', 'sealed'].includes(formData.auctionType)) e.auctionType = 'Please choose a valid auction type.'
    }

    if (step === 'config') {
      if (!formData.startTime) e.startTime = 'Start time is required.'
      if (!formData.endTime) e.endTime = 'End time is required.'
      if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
        e.endTime = 'End time must be after start time.'
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

  async function handleSubmit() {
    if (!validateStep('reserve')) {
      setCurrentStep('reserve')
      return
    }
    setBusy(true)
    try {
      console.log('Creating auction:', formData)
      // const newAuctionId = await createAuction(formData)
      // router.push(`/app/auction/${newAuctionId}`)
    } catch (e) {
      console.error('Failed to create auction:', e)
    } finally {
      setBusy(false)
    }
  }

  return {
    loading: isLoading,
    currentStep,
    setCurrentStep,
    steps,
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
      busy,
      handleSubmit,
    },
  }
}
