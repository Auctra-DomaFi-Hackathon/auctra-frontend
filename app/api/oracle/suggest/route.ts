import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')
  
  if (!domain) {
    return NextResponse.json(
      { error: 'Domain parameter is required' },
      { status: 400 }
    )
  }

  // Mock oracle logic - replace with real AI/ML model
  const domainLength = domain.replace(/\.(com|net|org|io|co)$/, '').length
  const tld = domain.split('.').pop()?.toLowerCase()
  
  let baseValue = 1000
  
  // Length-based pricing
  if (domainLength <= 3) baseValue = 10000
  else if (domainLength <= 5) baseValue = 5000
  else if (domainLength <= 7) baseValue = 2000
  else baseValue = 1000
  
  // TLD multiplier
  const tldMultiplier: Record<string, number> = {
    'com': 2.0,
    'net': 1.5,
    'org': 1.3,
    'io': 1.8,
    'co': 1.4,
  }
  
  const multiplier = tldMultiplier[tld || 'com'] || 1.0
  const suggestedReserve = Math.round(baseValue * multiplier)
  
  const rationale = [
    `Domain length (${domainLength} chars) suggests ${domainLength <= 5 ? 'premium' : 'standard'} value`,
    `TLD .${tld} has ${multiplier >= 1.5 ? 'strong' : 'moderate'} market performance`,
    'Historical data shows similar domains trade in this range',
    'Market sentiment is currently positive for this category'
  ]

  return NextResponse.json({
    reserve: suggestedReserve,
    rationale,
    confidence: 0.85,
    metadata: {
      domainLength,
      tld,
      multiplier,
      baseValue
    }
  })
}