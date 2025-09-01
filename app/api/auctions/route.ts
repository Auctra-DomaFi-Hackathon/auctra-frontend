import { NextResponse } from 'next/server'
import { mockAuctions } from '@/mocks/data'

export async function GET() {
  return NextResponse.json(mockAuctions)
}