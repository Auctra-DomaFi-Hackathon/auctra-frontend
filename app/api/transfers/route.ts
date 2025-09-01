import { NextResponse } from 'next/server'
import { mockTransfers } from '@/mocks/data'

export async function GET() {
  return NextResponse.json(mockTransfers)
}