'use client'
import { Hero } from '@/components/common/Hero'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { CTASection } from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <CTASection />
    </div>
  )
}