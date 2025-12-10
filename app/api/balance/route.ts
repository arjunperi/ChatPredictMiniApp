import { NextRequest, NextResponse } from 'next/server';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { getOrCreateUser } from '@/lib/tokens';
import { handleError } from '@/lib/errors/handlers';

export async function GET(request: NextRequest) {
  try {
    // Log incoming headers for debugging
    const initDataHeader = request.headers.get('x-telegram-init-data');
    const authHeader = request.headers.get('authorization');
    console.log('[Balance API] Request headers:', {
      hasInitDataHeader: !!initDataHeader,
      hasAuthHeader: !!authHeader,
      initDataLength: initDataHeader?.length || 0,
      allHeaders: Object.fromEntries(request.headers.entries()),
    });
    
    const telegramUser = await requireTelegramAuth(request);
    const userTelegramId = telegramUser.id.toString();
    
    console.log('[Balance API] Fetching balance for telegramId:', userTelegramId);
    
    const user = await getOrCreateUser(
      userTelegramId,
      telegramUser.username,
      telegramUser.first_name,
      telegramUser.last_name
    );
    
    if (!user) {
      throw new Error('Failed to get or create user');
    }
    
    console.log('[Balance API] User balance:', {
      userId: user.id,
      telegramId: userTelegramId,
      balance: user.tokenBalance,
    });
    
    return NextResponse.json({ balance: user.tokenBalance });
  } catch (error: any) {
    console.error('[Balance API] Error:', error);
    
    // Handle NextResponse errors (from requireTelegramAuth)
    if (error instanceof NextResponse) {
      console.error('[Balance API] Auth error - returning NextResponse directly');
      return error;
    }
    
    return handleError(error);
  }
}

