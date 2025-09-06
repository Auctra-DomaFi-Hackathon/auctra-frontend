'use client'

import { useEffect, useState } from 'react'
import { Hero } from '@/components/common/Hero'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { CTASection } from '@/components/sections/CTASection'
import { domainsService, auctionsService } from '@/lib/services'
import type { Domain, Auction } from '@/types'

export default function HomePage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [domainsData, auctionsData] = await Promise.all([
          domainsService.getAll(),
          auctionsService.getAll()
        ])
        setDomains(domainsData)
        setAuctions(auctionsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const activeAuctions = auctions
    .filter(auction => auction.status === 'active')
    .map(auction => {
      const domain = domains.find(d => d.id === auction.domainId)
      return { auction, domain }
    })
    .filter(item => item.domain)

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
    // TODO: Implement search functionality
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero Skeleton */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center">
          <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center py-20 sm:py-32 lg:py-40 relative z-20 max-w-7xl">
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-8 max-w-4xl mx-auto"></div>
                <div className="h-8 bg-gray-200 rounded mb-12 max-w-2xl mx-auto"></div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <div className="h-12 w-40 bg-gray-200 rounded-xl"></div>
                  <div className="h-12 w-40 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Skeleton */}
        <section className="py-20 bg-backgroundAlt">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4 max-w-2xl mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded mb-16 max-w-3xl mx-auto"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <div className="col-span-1 lg:col-span-2 h-80 bg-gray-200 rounded-2xl"></div>
                <div className="col-span-1 h-80 bg-gray-200 rounded-2xl"></div>
                <div className="col-span-1 lg:col-span-3 h-96 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <Features />



      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}