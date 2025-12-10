import { NextRequest, NextResponse } from 'next/server';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { getOrCreateUser } from '@/lib/tokens';
import { handleError } from '@/lib/errors/handlers';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const telegramUser = await requireTelegramAuth(request);
    const userTelegramId = telegramUser.id.toString();
    
    console.log('[Clear Positions API] Clearing positions for telegramId:', userTelegramId);
    
    const user = await getOrCreateUser(
      userTelegramId,
      telegramUser.username,
      telegramUser.first_name,
      telegramUser.last_name
    );
    
    if (!user) {
      throw new Error('Failed to get or create user');
    }
    
    // Get all user's bets
    const bets = await prisma.bet.findMany({
      where: {
        userId: user.id,
      },
    });
    
    const betCount = bets.length;
    
    // Delete all bets
    await prisma.bet.deleteMany({
      where: {
        userId: user.id,
      },
    });
    
    console.log('[Clear Positions API] Cleared positions:', {
      userId: user.id,
      betsDeleted: betCount,
    });
    
    return NextResponse.json({
      success: true,
      betsDeleted: betCount,
      message: `Cleared ${betCount} position(s)`,
    });
  } catch (error: any) {
    console.error('[Clear Positions API] Error:', error);
    
    // Handle NextResponse errors (from requireTelegramAuth)
    if (error instanceof NextResponse) {
      return error;
    }
    
    return handleError(error);
  }
}

