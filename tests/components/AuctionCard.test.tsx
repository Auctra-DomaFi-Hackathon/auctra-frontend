import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AuctionCard } from '@/features/auction/AuctionCard'
import type { Auction, Domain } from '@/types'

const mockDomain: Domain = {
  id: 'd1',
  name: 'test.com',
  tld: '.com',
  status: 'expiring',
  expiresAt: '2025-01-15T00:00:00.000Z',
  owner: null,
  dnsVerified: true,
  trafficScore: 87,
  renewalCostUsd: 12,
  oracleReserveUsd: 4200,
  fairValueBandUsd: { min: 3800, max: 5200 },
  oracleConfidence: 0.82,
  nftTokenId: null,
  currentAuctionId: 'a1'
}

const mockAuction: Auction = {
  id: 'a1',
  domainId: 'd1',
  type: 'dutch',
  status: 'active',
  startTime: '2025-08-18T07:00:00.000Z',
  endTime: '2025-08-19T07:00:00.000Z',
  revealStart: null,
  revealEnd: null,
  parameters: {
    dutch: { startPriceUsd: 6000, floorPriceUsd: 3000, durationSec: 86400 },
    sealed: null
  },
  feesBps: { protocol: 150, creator: 50 },
  antiSnipingExtensionSec: 120,
  activity: []
}

describe('AuctionCard', () => {
  it('renders auction and domain information correctly', () => {
    render(<AuctionCard auction={mockAuction} domain={mockDomain} />)
    
    expect(screen.getByText('test.com')).toBeInTheDocument()
    expect(screen.getByText('dutch • active')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText(/\$4,200/)).toBeInTheDocument()
  })

  it('shows current price for Dutch auction', () => {
    render(<AuctionCard auction={mockAuction} domain={mockDomain} />)
    
    expect(screen.getByText('Current Price')).toBeInTheDocument()
    expect(screen.getByText('Floor')).toBeInTheDocument()
    expect(screen.getByText(/\$3,000/)).toBeInTheDocument()
  })

  it('renders place bid button for active auction', () => {
    render(<AuctionCard auction={mockAuction} domain={mockDomain} />)
    
    const bidButton = screen.getByRole('link', { name: /place bid/i })
    expect(bidButton).toBeInTheDocument()
    expect(bidButton).toHaveAttribute('href', '/auction/a1')
  })
})