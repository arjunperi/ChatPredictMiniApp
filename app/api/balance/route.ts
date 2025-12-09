import { NextRequest, NextResponse } from 'next/server';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { getOrCreateUser } from '@/lib/tokens';
import { handleError } from '@/lib/errors/handlers';

export async function GET(request: NextRequest) {
  try {
    // Require Telegram authentication
    const telegramUser = await requireTelegramAuth(request);
    const userTelegramId = telegramUser.id.toString();

    console.log('[Balance API] Fetching balance for telegramId:', userTelegramId);

    // Get or create user (ensures user exists with initial balance)
    const user = await getOrCreateUser(
      userTelegramId,
      telegramUser.username,
      telegramUser.first_name,
      telegramUser.last_name
    );

    console.log('[Balance API] User found/created:', {
      userId: user.id,
      telegramId: userTelegramId,
      balance: user.tokenBalance,
    });

    return NextResponse.json({ balance: user.tokenBalance });
  } catch (error) {
    console.error('[Balance API] Error:', error);
    return handleError(error, 'Failed to fetch balance');
  }
}

