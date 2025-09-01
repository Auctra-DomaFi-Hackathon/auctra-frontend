import { NextResponse } from 'next/server'
import { mockNotifications } from '@/mocks/data'

export async function GET() {
  return NextResponse.json(mockNotifications)
}