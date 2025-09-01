import { NextResponse } from 'next/server'
import { mockDomains } from '@/mocks/data'

export async function GET() {
  return NextResponse.json(mockDomains)
}