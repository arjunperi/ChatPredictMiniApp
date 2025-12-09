import { NextRequest, NextResponse } from 'next/server';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { prisma } from '@/lib/db/prisma';
import { MarketStatus, TransactionType } from '@prisma/client';
import { handleError } from '@/lib/errors/handlers';

export async function GET(request: NextRequest) {
  try {
    // Require Telegram authentication
    const telegramUser = await requireTelegramAuth(request);
    const userTelegramId = telegramUser.id.toString();

    // Get user with bets and transactions
    const user = await prisma.user.findUnique({
      where: { telegramId: userTelegramId },
      include: {
        bets: {
          include: {
            market: true,
          },
        },
        transactions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const balance = user.tokenBalance;

    // Active positions: bets in ACTIVE markets
    const activePositions = user.bets.filter(
      (bet) => bet.market.status === MarketStatus.ACTIVE
    ).length;

    // Total invested: sum of all bet amounts
    const totalInvested = user.bets.reduce(
      (sum, bet) => sum + bet.amount,
      0
    );

    // Total returns: sum of positive transactions (SHARES_SOLD, BET_WON, MARKET_RESOLVED)
    const totalReturns = user.transactions
      .filter(
        (tx) =>
          tx.type === TransactionType.SHARES_SOLD ||
          tx.type === TransactionType.BET_WON ||
          tx.type === TransactionType.MARKET_RESOLVED
      )
      .reduce((sum, tx) => sum + Math.max(0, tx.amount), 0);

    // Net P&L: total returns - total invested
    const netPL = totalReturns - totalInvested;

    return NextResponse.json({
      balance,
      activePositions,
      totalInvested,
      totalReturns,
      netPL,
    });
  } catch (error) {
    return handleError(error);
  }
}

