import { NextRequest, NextResponse } from 'next/server';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { getOrCreateUser } from '@/lib/tokens';
import { handleError } from '@/lib/errors/handlers';
import { prisma } from '@/lib/db/prisma';
import { MarketStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const telegramUser = await requireTelegramAuth(request);
    const userTelegramId = telegramUser.id.toString();
    
    console.log('[User Stats API] Fetching stats for telegramId:', userTelegramId);
    
    const user = await getOrCreateUser(
      userTelegramId,
      telegramUser.username,
      telegramUser.first_name,
      telegramUser.last_name
    );
    
    if (!user) {
      throw new Error('Failed to get or create user');
    }
    
    // Get all user's bets with market info
    const bets = await prisma.bet.findMany({
      where: {
        userId: user.id,
      },
      include: {
        market: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
    
    // Calculate active positions: unique markets where user has bets AND market is ACTIVE
    const activeMarketIds = new Set<string>();
    bets.forEach((bet) => {
      if (bet.market.status === MarketStatus.ACTIVE) {
        activeMarketIds.add(bet.marketId);
      }
    });
    const activePositions = activeMarketIds.size;
    
    // Calculate total invested: sum of all bet amounts
    const totalInvested = bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    // TODO: Calculate totalReturns and netPL from resolved markets
    // For now, these are placeholders
    const totalReturns = 0;
    const netPL = 0;
    
    const stats = {
      balance: user.tokenBalance,
      activePositions,
      totalInvested,
      totalReturns,
      netPL,
    };
    
    console.log('[User Stats API] Stats calculated:', stats);
    
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('[User Stats API] Error:', error);
    
    // Handle NextResponse errors (from requireTelegramAuth)
    if (error instanceof NextResponse) {
      return error;
    }
    
    return handleError(error);
  }
}

