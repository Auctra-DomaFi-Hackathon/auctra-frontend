'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight, Loader2, Globe, Clock, CheckCircle } from 'lucide-react'
import { useMyDomains } from '@/lib/graphql/hooks'
import type { EnhancedDomainItem } from '@/lib/graphql/services'
import { useAccount } from 'wagmi'
import { toast } from '@/hooks/use-toast'

interface DomainSelectorProps {
  onDomainSelect: (domain: EnhancedDomainItem) => void
  selectedDomain?: EnhancedDomainItem
  disabled?: boolean
}

export default function DomainSelector({ onDomainSelect, selectedDomain, disabled }: DomainSelectorProps) {
  const { address } = useAccount()
  const { domains, loading, error, refetch } = useMyDomains(address)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter domains based on search query
  const filteredDomains = domains.filter(domain => 
    domain.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDomainSelect = (domain: EnhancedDomainItem) => {
    // Check if domain has required fields
    if (!domain.tokenId || !domain.tokenAddress) {
      toast({
        title: "Invalid Domain",
        description: "This domain doesn't have the required token information.",
        variant: "destructive",
      })
      return
    }

    // Check if domain is expiring soon (within 30 days)
    if (isExpiringSoon(domain.expiresAt)) {
      toast({
        title: "Domain Expiring Soon",
        description: "This domain expires within 30 days and may not be suitable as collateral.",
        variant: "destructive",
      })
      // Don't prevent selection, just warn the user
    }

    onDomainSelect(domain)
    setIsOpen(false)
    setSearchQuery('')
  }

  const formatDomainName = (domain: EnhancedDomainItem) => {
    // Extract TLD from domain name
    const parts = domain.name.split('.')
    if (parts.length > 1) {
      return {
        name: parts[0],
        tld: '.' + parts.slice(1).join('.')
      }
    }
    return {
      name: domain.name,
      tld: '.doma' // Default TLD
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    return expirationDate < thirtyDaysFromNow
  }

  const formatExpirationDate = (expiresAt: string) => {
    return new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // If user has selected domain, show the selected domain info
  if (selectedDomain) {
    const { name, tld } = formatDomainName(selectedDomain)
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-800 dark:text-green-300">{name}</span>
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-400 dark:bg-green-900/20">
                    {tld}
                  </Badge>
                </div>
                <div className="text-xs text-green-600 mt-1 dark:text-green-400">
                  Token ID: {(() => {
                    const tokenId = selectedDomain.tokenId?.toString();
                    if (!tokenId) return 'N/A';
                    if (tokenId.length > 20) {
                      return `${tokenId.slice(0, 10)}....${tokenId.slice(-11)}`;
                    }
                    return tokenId;
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={disabled}>
                    Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 dark:text-white">
                      <Globe className="h-5 w-5" />
                      Select Domain NFT
                    </DialogTitle>
                  </DialogHeader>
                  <DomainSelectionContent
                    domains={filteredDomains}
                    loading={loading}
                    error={error}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onDomainSelect={handleDomainSelect}
                    onRefresh={refetch}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no domain selected, show the selector trigger
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <Globe className="h-8 w-8" />
              <div className="text-center">
                <p className="font-medium dark:text-gray-500">Select Domain NFT</p>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                  Choose a domain to use as collateral
                </p>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Globe className="h-5 w-5" />
            Select Domain NFT
          </DialogTitle>
        </DialogHeader>
        <DomainSelectionContent
          domains={filteredDomains}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDomainSelect={handleDomainSelect}
          onRefresh={refetch}
        />
      </DialogContent>
    </Dialog>
  )
}

interface DomainSelectionContentProps {
  domains: EnhancedDomainItem[]
  loading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onDomainSelect: (domain: EnhancedDomainItem) => void
  onRefresh: () => void
}

function DomainSelectionContent({
  domains,
  loading,
  error,
  searchQuery,
  onSearchChange,
  onDomainSelect,
  onRefresh
}: DomainSelectionContentProps) {
  const formatDomainName = (domain: EnhancedDomainItem) => {
    const parts = domain.name.split('.')
    if (parts.length > 1) {
      return {
        name: parts[0],
        tld: '.' + parts.slice(1).join('.')
      }
    }
    return {
      name: domain.name,
      tld: '.doma'
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    return expirationDate < thirtyDaysFromNow
  }

  const formatExpirationDate = (expiresAt: string) => {
    return new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Search your domains..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your domains...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2 dark:text-red-400">Failed to load domains</div>
            <div className="text-sm text-gray-500 mb-4 dark:text-gray-400">{error}</div>
            <Button variant="outline" onClick={onRefresh} size="sm">
              Try Again
            </Button>
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4 dark:text-gray-500" />
            <div className="text-gray-600 mb-2 dark:text-gray-400">
              {searchQuery ? 'No domains found' : 'No domains available'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'You need to own domain NFTs to use them as collateral'
              }
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {domains.map((domain, index) => {
              const { name, tld } = formatDomainName(domain)
              const expiringSoon = isExpiringSoon(domain.expiresAt)
              
              return (
                <Card 
                  key={`${domain.tokenAddress}-${domain.tokenId}-${index}`}
                  className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-500 dark:bg-gray-800"
                  onClick={() => onDomainSelect(domain)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                              {tld}
                            </Badge>
                            {expiringSoon && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                <Clock className="h-3 w-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 dark:text-gray-400">
                            <span>Token ID: {(() => {
                              const tokenId = domain.tokenId?.toString();
                              if (!tokenId) return 'N/A';
                              if (tokenId.length > 20) {
                                return `${tokenId.slice(0, 10)}....${tokenId.slice(-11)}`;
                              }
                              return tokenId;
                            })()}</span>
                            <span>Expires: {formatExpirationDate(domain.expiresAt)}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}