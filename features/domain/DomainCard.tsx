'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, ExternalLink } from 'lucide-react'
import { formatCurrency, formatTimeAgo } from '@/lib/utils/index'
import { useUserStore } from '@/lib/store'
import type { Domain } from '@/types'

interface DomainCardProps {
  domain: Domain
  className?: string
}

export function DomainCard({ domain, className = "" }: DomainCardProps) {
  const { user, addToWatchlist, removeFromWatchlist } = useUserStore()
  const isWatched = user?.watchlistDomainIds.includes(domain.id) || false

  const handleWatchlistToggle = () => {
    if (isWatched) {
      removeFromWatchlist(domain.id)
    } else {
      addToWatchlist(domain.id)
    }
  }

  const statusColors = {
    expiring: 'outline',
    active: 'secondary',
    sold: 'secondary'
  } as const

  return (
    <Card className={`card-hover ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">{domain.name}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={domain.status ? statusColors[domain.status] || 'outline' : 'outline'}>
                {domain.status}
              </Badge>
              {domain.dnsVerified && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchlistToggle}
            className="focus-ring"
          >
            <Heart 
              className={`w-4 h-4 ${isWatched ? 'fill-current text-red-500' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Traffic Score</div>
            <div className="font-semibold">{domain.trafficScore}/100</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Renewal Cost</div>
            <div className="font-semibold">{formatCurrency(domain.renewalCostUsd || 0)}</div>
          </div>
        </div>

        {/* Oracle Info */}
        <div className="p-3 bg-secondary/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Oracle Reserve</span>
            <Badge variant="outline" className="text-xs">
              {Math.round((domain.oracleConfidence || 0) * 100)}% confidence
            </Badge>
          </div>
          <div className="text-lg font-bold text-primary">
            {formatCurrency(domain.oracleReserveUsd || 0)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Fair Value: {formatCurrency(domain.fairValueBandUsd?.min || 0)} - {formatCurrency(domain.fairValueBandUsd?.max || 0)}
          </div>
        </div>

        {/* Expiry Info */}
        {domain.status === 'expiring' && domain.expiresAt && (
          <div className="text-sm text-muted-foreground">
            Expires: {new Date(domain.expiresAt).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button asChild className="flex-1 focus-ring">
            <Link href={`/domain/${domain.name}`}>
              View Details
            </Link>
          </Button>
          {domain.currentAuctionId && (
            <Button variant="outline" asChild className="focus-ring">
              <Link href={`/auction/${domain.currentAuctionId}`}>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}