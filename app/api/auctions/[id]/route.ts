import { NextResponse } from 'next/server'
import { mockAuctions } from '@/mocks/data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auction = mockAuctions.find(a => a.id === params.id)
  
  if (!auction) {
    return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
  }
  
  return NextResponse.json(auction)
}