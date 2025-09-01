import { NextResponse } from 'next/server'
import { mockOrderbook } from '@/mocks/data'

export async function GET() {
  return NextResponse.json(mockOrderbook)
}