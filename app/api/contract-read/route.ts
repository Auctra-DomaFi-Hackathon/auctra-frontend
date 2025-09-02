import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { DOMA_TESTNET } from '@/hooks/contracts/constants'

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: DOMA_TESTNET,
  transport: http()
})

export async function POST(request: NextRequest) {
  try {
    const { address, abi, functionName, args } = await request.json()

    if (!address || !functionName) {
      return NextResponse.json(
        { error: 'Missing required parameters: address and functionName' },
        { status: 400 }
      )
    }

    const result = await publicClient.readContract({
      address: address as `0x${string}`,
      abi,
      functionName,
      args: args || []
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Contract read error:', error)
    return NextResponse.json(
      { error: 'Failed to read from contract' },
      { status: 500 }
    )
  }
}