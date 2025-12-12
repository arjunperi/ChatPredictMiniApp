import { NextRequest, NextResponse } from 'next/server';
import { getMarkets, createMarket } from '@/lib/market';
import { validateMarketQuestion } from '@/lib/utils/validation';
import { MarketStatus } from '@prisma/client';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { handleError } from '@/lib/errors/handlers';
import { LMSR } from '@/lib/lmsr';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chatId') || undefined;
    const status = searchParams.get('status') as MarketStatus || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('[Markets API] GET request:', { chatId, status, limit, offset });
    console.log('[Markets API] DATABASE_URL exists:', !!process.env.DATABASE_URL);

    const markets = await getMarkets({ chatId, status, limit, offset });

    console.log('[Markets API] Successfully fetched markets:', { count: markets.length });
    
    // Calculate probabilityYes for each market (same as detail API)
    const marketsWithProbability = markets.map((market) => {
      const lmsr = new LMSR(market.liquidity);
      const probabilityYes = lmsr.getProbability(market.sharesYes, market.sharesNo);
      return {
        ...market,
        probabilityYes,
      };
    });
    
    return NextResponse.json({ markets: marketsWithProbability });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Markets API] Error fetching markets:', {
      error: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch markets',
        details: errorMessage,
        // Only include stack in development
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Telegram authentication
    const user = await requireTelegramAuth(request);
    const creatorTelegramId = user.id.toString();

    const body = await request.json();
    const { question, chatId, liquidity = 100, closesAt } = body;

    // Validate inputs
    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }

    // Use a default chatId if not provided (for Mini App, might not have chatId)
    const finalChatId = chatId || `miniapp-${user.id}`;

    const validation = validateMarketQuestion(question);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const market = await createMarket(
      question,
      creatorTelegramId,
      finalChatId,
      liquidity,
      closesAt ? new Date(closesAt) : null
    );

    return NextResponse.json({ market }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error; // Already formatted error response
    }
    return handleError(error);
  }
}

