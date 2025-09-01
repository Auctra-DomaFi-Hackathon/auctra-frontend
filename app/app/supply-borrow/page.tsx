'use client'

import PageHeader from './_components/header/PageHeader'
import DomainsList from './_components/domains/DomainsList'
import SkeletonLoader from './_components/loading/SkeletonLoader'
import { useState, useEffect } from 'react'

export default function SupplyBorrowPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SkeletonLoader />
  }

  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      <PageHeader />
      <DomainsList loading={false} query={query} onQueryChange={setQuery} />
    </div>
  )
}
