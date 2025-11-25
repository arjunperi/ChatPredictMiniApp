import { NextRequest, NextResponse } from 'next/server';
import { getMarketById } from '@/lib/market';
import { LMSR } from '@/lib/lmsr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const market = await getMarketById(id);

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    // Calculate current probability
    const lmsr = new LMSR(market.liquidity);
    const probabilityYes = lmsr.getProbability(market.sharesYes, market.sharesNo);

    return NextResponse.json({
      ...market,
      probabilityYes,
    });
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market' },
      { status: 500 }
    );
  }
}

