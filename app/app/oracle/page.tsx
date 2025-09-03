'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Calendar,
  DollarSign 
} from 'lucide-react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { toast } from '@/hooks/use-toast'
import { useOracleSetup } from './_hooks/useOracleSetup'
import { useMyDomains } from '@/lib/graphql/hooks'
import DomainSelector from '../supply-borrow/_components/domains/DomainSelector'
import OracleSkeleton from './_components/OracleSkeleton'
import type { EnhancedDomainItem } from '@/lib/graphql/services'

export default function OraclePage() {
  const { isConnected, address } = useAccount()
  const {
    setDomainInfo,
    isDomainInfoLoading,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error
  } = useOracleSetup()
  
  // Get domains loading state for skeleton
  const { loading: isLoadingDomains } = useMyDomains(address)

  const [selectedDomain, setSelectedDomain] = useState<EnhancedDomainItem | undefined>()
  const [valueUsd, setValueUsd] = useState('1000')
  const [expiryYears, setExpiryYears] = useState('2')

  // Calculate expiry timestamp
  const calculateExpiryTimestamp = (years: string) => {
    const yearsNum = parseInt(years) || 1
    const currentTime = Math.floor(Date.now() / 1000)
    return currentTime + (yearsNum * 365 * 24 * 60 * 60)
  }

  // Format value to 6 decimals for USDC
  const formatValueToUsd6 = (value: string) => {
    const valueNum = parseFloat(value) || 0
    return Math.floor(valueNum * 1000000) // Convert to 6 decimals
  }

  const handleSetPremiumDomain = async () => {
    if (!selectedDomain || !selectedDomain.tokenId || !selectedDomain.tokenAddress) {
      toast({
        title: "Invalid Domain",
        description: "Please select a valid domain NFT.",
        variant: "destructive",
      })
      return
    }

    const valueUsd6 = formatValueToUsd6(valueUsd)
    if (valueUsd6 <= 0) {
      toast({
        title: "Invalid Value",
        description: "Domain value must be greater than 0 USD.",
        variant: "destructive",
      })
      return
    }

    const expiryTimestamp = calculateExpiryTimestamp(expiryYears)
    const currentTime = Math.floor(Date.now() / 1000)
    const minimumExpiry = currentTime + (30 * 24 * 60 * 60) // 30 days

    if (expiryTimestamp <= minimumExpiry) {
      toast({
        title: "Invalid Expiry",
        description: "Domain must expire at least 30 days from now.",
        variant: "destructive",
      })
      return
    }

    try {
      await setDomainInfo({
        nftContract: selectedDomain.tokenAddress,
        tokenId: BigInt(selectedDomain.tokenId),
        isPremium: true,
        valueUsd6: BigInt(valueUsd6),
        expiresAt: BigInt(expiryTimestamp)
      })
    } catch (err) {
      console.error('Failed to set domain info:', err)
    }
  }

  // Success toast with transaction link
  const showSuccessToast = (hash: string) => {
    const txLink = `https://explorer-testnet.doma.xyz/tx/${hash}`
    
    toast({
      title: "Domain Premium Setup Successful",
      description: (
        <div className="space-y-2">
          <p>Successfully set domain as premium with Oracle</p>
          <a 
            href={txLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ),
      duration: 8000,
    })
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      showSuccessToast(hash)
      // Reset form
      setSelectedDomain(undefined)
      setValueUsd('1000')
      setExpiryYears('2')
    }
  }, [isConfirmed, hash])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [error])

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 lg:px-12 py-10">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600">Connect your wallet to access Oracle configuration</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show skeleton loading when domains are loading
  if (isConnected && isLoadingDomains) {
    return <OracleSkeleton />
  }

  return (
    <div className="container mx-auto px-6 lg:px-12 py-10">
      {/* Page Header */}
      <Card className="border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm mb-8">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  Domain Oracle Configuration
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Set up premium domains for lending pool collateral
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Testing Mode
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Domain Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Select Domain NFT
            </CardTitle>
            <p className="text-sm text-gray-600">
              Choose a domain NFT to configure as premium collateral
            </p>
          </CardHeader>
          <CardContent>
            <DomainSelector
              onDomainSelect={setSelectedDomain}
              selectedDomain={selectedDomain}
              disabled={isPending || isConfirming}
            />
          </CardContent>
        </Card>

        {/* Right Column - Oracle Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Premium Configuration
            </CardTitle>
            <p className="text-sm text-gray-600">
              Set domain value and expiry for premium status
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Value */}
            <div>
              <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                Domain Value (USD)
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="value"
                  type="number"
                  placeholder="1000"
                  value={valueUsd}
                  onChange={(e) => setValueUsd(e.target.value)}
                  className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="1"
                  step="1"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-sm font-medium text-gray-600">USD</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum value: $1 USD
              </p>
            </div>

            {/* Expiry Years */}
            <div>
              <Label htmlFor="expiry" className="text-sm font-medium text-gray-700">
                Expiry (Years from now)
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="expiry"
                  type="number"
                  placeholder="2"
                  value={expiryYears}
                  onChange={(e) => setExpiryYears(e.target.value)}
                  className="pr-20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="1"
                  max="10"
                  step="1"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Years</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 30 days from now
              </p>
            </div>

            {/* Preview */}
            {selectedDomain && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Configuration Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Domain:</span>
                    <span className="font-medium text-blue-900">{selectedDomain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Token ID:</span>
                    <span className="font-mono text-blue-900">
                      {(() => {
                        const tokenId = selectedDomain.tokenId?.toString();
                        if (!tokenId) return 'N/A';
                        if (tokenId.length > 20) {
                          return `${tokenId.slice(0, 10)}....${tokenId.slice(-11)}`;
                        }
                        return tokenId;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Value:</span>
                    <span className="font-medium text-blue-900">${valueUsd} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className="font-medium text-green-600">Premium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Expires:</span>
                    <span className="font-medium text-blue-900">
                      {new Date(calculateExpiryTimestamp(expiryYears) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Set Premium Button */}
            <Button
              onClick={handleSetPremiumDomain}
              disabled={!selectedDomain || isDomainInfoLoading || isPending || isConfirming}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isDomainInfoLoading || isPending || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending ? 'Setting Premium...' : isConfirming ? 'Confirming...' : 'Loading...'}
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Set Domain as Premium
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Oracle Configuration Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-blue-600 mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Domain must have valid NFT token ID
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Value must be greater than $0 USD
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Expiry must be at least 30 days from now
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Status will be set to isPremium = true
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-3">After Configuration</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  Domain can be used as collateral in lending pools
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  Oracle will return premium status and value
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  Users can deposit domain for borrowing USDC
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  Configuration is stored on-chain via MockDomainOracle
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}