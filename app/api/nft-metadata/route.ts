import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenURI = searchParams.get('tokenURI');

  if (!tokenURI) {
    return NextResponse.json({ error: 'tokenURI parameter required' }, { status: 400 });
  }

  try {
    console.log('🌐 Fetching NFT metadata from:', tokenURI);
    
    const response = await fetch(tokenURI, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Auctra-Frontend/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();
    console.log('📋 Metadata fetched:', metadata);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Failed to fetch NFT metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT metadata' },
      { status: 500 }
    );
  }
}