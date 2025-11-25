import { NextRequest, NextResponse } from 'next/server';
import { getMarkets, createMarket } from '@/lib/market';
import { validateMarketQuestion } from '@/lib/utils/validation';
import { MarketStatus } from '@prisma/client';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { handleError } from '@/lib/errors/handlers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chatId') || undefined;
    const status = searchParams.get('status') as MarketStatus || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const markets = await getMarkets({ chatId, status, limit, offset });

    return NextResponse.json({ markets });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
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

