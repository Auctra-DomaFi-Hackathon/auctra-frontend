import { NextResponse } from 'next/server'
import { mockBids } from '@/mocks/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const auctionId = searchParams.get('auctionId')
  
  if (auctionId) {
    const filteredBids = mockBids.filter(b => b.auctionId === auctionId)
    return NextResponse.json(filteredBids)
  }
  
  return NextResponse.json(mockBids)
}