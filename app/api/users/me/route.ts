import { NextResponse } from 'next/server'
import { mockUser } from '@/mocks/data'

export async function GET() {
  return NextResponse.json(mockUser)
}