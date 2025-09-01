import { NextResponse } from 'next/server'
import { mockDomains } from '@/mocks/data'

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const domain = mockDomains.find(d => d.name === params.name)
  
  if (!domain) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
  }
  
  return NextResponse.json(domain)
}