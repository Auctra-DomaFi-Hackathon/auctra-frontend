'use client'

import { useEffect, useMemo, useState } from 'react'
import { auctionsService, domainsService } from '@/lib/services'
import { getCurrentDutchPrice } from '@/lib/utils/auction'
import type { Auction, Domain } from '@/types'
import { useDebounce } from './useDebounce'

export type StatusTab = 'expiring' | 'ongoing' | 'liquidation'
type SortKey = 'ending-soon' | 'newest' | 'price-low' | 'price-high'

export function useExploreData() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  // filters
  const [searchQuery, setSearchQuery] = useState('')
  const q = useDebounce(searchQuery, 250)
  const [selectedTLDs, setSelectedTLDs] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]) // lowercased
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('ending-soon')
  const [tab, setTab] = useState<StatusTab>('ongoing')

  // load data progressively
  useEffect(() => {
    const load = async () => {
      try {
        // Load UI first, then data progressively
        setLoading(false)
        
        // Load domains first (lighter)
        const d = await domainsService.getAll()
        setDomains(d)
        
        // Then load auctions
        const a = await auctionsService.getAll()
        setAuctions(a)
      } catch (e) {
        console.error('Failed to load data:', e)
        setLoading(false)
      }
    }
    load()
  }, [])

  // helpers
  const domainById = useMemo(() => {
    const m = new Map<string, Domain>()
    domains.forEach((d) => m.set(d.id, d))
    return m
  }, [domains])

  const tlds = useMemo(() => Array.from(new Set(domains.map((d) => d.tld))).sort(), [domains])
  const auctionTypes = ['Dutch', 'Sealed Bid', 'English'] as const

  const applyStatus = (a: Auction, status: StatusTab) => {
    const end = new Date(a.endTime).getTime()
    const in24h = end < Date.now() + 24 * 60 * 60 * 1000
    if (status === 'expiring') return a.status === 'active' && in24h
    if (status === 'ongoing') return a.status === 'active'
    if (status === 'liquidation') return (a.type || '').toLowerCase() === 'liquidation'
    return true
  }

  const byStatus = useMemo(() => {
    function applyFilters(list: Auction[]) {
      let out = list

      if (q) {
        const ql = q.toLowerCase()
        out = out.filter((a) => domainById.get(a.domainId)?.name.toLowerCase().includes(ql))
      }
      if (selectedTLDs.length) {
        out = out.filter((a) => {
          const d = domainById.get(a.domainId)
          return d && selectedTLDs.includes(d.tld)
        })
      }
      if (selectedTypes.length) {
        out = out.filter((a) => selectedTypes.includes((a.type || '').toLowerCase()))
      }
      if (priceMin || priceMax) {
        const min = priceMin ? parseFloat(priceMin) : 0
        const max = priceMax ? parseFloat(priceMax) : Number.POSITIVE_INFINITY
        out = out.filter((a) => {
          const price =
            a.type === 'dutch' && a.parameters.dutch
              ? getCurrentDutchPrice(a)
              : a.parameters.sealed?.minDepositUsd || 0
          return price >= min && price <= max
        })
      }
      return out
    }

    function applySort(list: Auction[]) {
      const copy = [...list]
      const priceOf = (x: Auction) =>
        x.type === 'dutch' && x.parameters.dutch
          ? getCurrentDutchPrice(x)
          : x.parameters.sealed?.minDepositUsd || 0

      if (sortBy === 'ending-soon') copy.sort((a, b) => +new Date(a.endTime) - +new Date(b.endTime))
      else if (sortBy === 'newest') copy.sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime))
      else if (sortBy === 'price-low') copy.sort((a, b) => priceOf(a) - priceOf(b))
      else if (sortBy === 'price-high') copy.sort((a, b) => priceOf(b) - priceOf(a))
      return copy
    }

    const base: Record<StatusTab, Auction[]> = { expiring: [], ongoing: [], liquidation: [] }
    auctions.forEach((a) => {
      (['expiring', 'ongoing', 'liquidation'] as StatusTab[]).forEach((s) => {
        if (applyStatus(a, s)) base[s].push(a)
      })
    })

    return {
      expiring: applySort(applyFilters(base.expiring)),
      ongoing: applySort(applyFilters(base.ongoing)),
      liquidation: applySort(applyFilters(base.liquidation)),
    }
  }, [auctions, q, selectedTLDs, selectedTypes, priceMin, priceMax, sortBy, domainById])

  const counts = {
    expiring: byStatus.expiring.length,
    ongoing: byStatus.ongoing.length,
    liquidation: byStatus.liquidation.length,
  }

  // togglers
  const toggleTLD = (tld: string, checked: boolean) =>
    setSelectedTLDs((prev) => (checked ? [...prev, tld] : prev.filter((x) => x !== tld)))

  const toggleType = (type: string, checked: boolean) => {
    const key = type.toLowerCase()
    setSelectedTypes((prev) => (checked ? [...prev, key] : prev.filter((x) => x !== key)))
  }

  return {
    loading,
    tab, setTab,
    searchQuery, setSearchQuery,
    tlds, auctionTypes,
    selectedTLDs, toggleTLD,
    selectedTypes, toggleType,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    sortBy, setSortBy,
    byStatus, counts,
    domainById,
  }
}
