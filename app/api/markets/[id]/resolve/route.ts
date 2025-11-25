import { NextRequest, NextResponse } from 'next/server';
import { resolveMarket } from '@/lib/resolution';
import { Resolution } from '@prisma/client';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { handleError, createErrorResponse } from '@/lib/errors/handlers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require Telegram authentication
    const telegramUser = await requireTelegramAuth(request);
    const resolverTelegramId = telegramUser.id.toString();

    const { id } = await params;
    const body = await request.json();
    const { resolution } = body;

    // Validate inputs
    if (!resolution) {
      return createErrorResponse('Missing required field: resolution', 400);
    }

    if (resolution !== 'YES' && resolution !== 'NO') {
      return createErrorResponse('Resolution must be YES or NO', 400);
    }

    const result = await resolveMarket(
      id,
      resolution as Resolution,
      resolverTelegramId
    );

    return NextResponse.json({
      success: true,
      market: result.market,
      payouts: result.payouts,
    });
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error;
    }
    return handleError(error);
  }
}

