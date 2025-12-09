import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { LMSR } from '@/lib/lmsr';
import { retryWithBackoff } from '@/lib/utils/retry';
import { MarketStatus, TransactionType } from '@prisma/client';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { handleError } from '@/lib/errors/handlers';

export async function POST(req: NextRequest) {
  try {
    // Require Telegram authentication
    const telegramUser = await requireTelegramAuth(req);
    const userTelegramId = telegramUser.id.toString();

    const body = await req.json();
    const { betId, shares } = body;

    // Validation
    if (!betId) {
      return NextResponse.json(
        { error: 'Missing required field: betId' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { telegramId: userTelegramId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the bet
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: { market: true },
    });

    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }

    // Verify bet belongs to user
    if (bet.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const market = bet.market;
    const sharesToSell = shares || bet.shares; // Default to all shares if not specified

    if (sharesToSell <= 0 || sharesToSell > bet.shares) {
      return NextResponse.json(
        { error: 'Invalid shares amount' },
        { status: 400 }
      );
    }

    // Execute everything in a single transaction with proper locking and retry on conflicts
    const result = await retryWithBackoff(async () => {
      return prisma.$transaction(async (tx) => {
        // 1. Re-read market with lock
        const lockedMarket = await tx.market.findUnique({
          where: { id: market.id },
        });

        if (!lockedMarket) {
          throw new Error('Market not found');
        }

        if (lockedMarket.status !== MarketStatus.ACTIVE) {
          throw new Error('Market is not active');
        }

        // 2. Re-read bet to ensure it still exists
        const lockedBet = await tx.bet.findUnique({
          where: { id: betId },
        });

        if (!lockedBet || lockedBet.shares < sharesToSell) {
          throw new Error('Insufficient shares');
        }

        // 3. Calculate payout using LMSR
        const lmsr = new LMSR(lockedMarket.liquidity);
        const lmsrResult =
          bet.outcome === 'YES'
            ? lmsr.sellYes(lockedMarket.sharesYes, lockedMarket.sharesNo, sharesToSell)
            : lmsr.sellNo(lockedMarket.sharesYes, lockedMarket.sharesNo, sharesToSell);

        // 4. Update bet shares (reduce by shares sold)
        await tx.bet.update({
          where: { id: betId },
          data: {
            shares: { decrement: sharesToSell },
          },
        });

        // 5. Update user balance
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            tokenBalance: { increment: lmsrResult.payout },
          },
        });

        // 6. Create transaction record
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: TransactionType.SHARES_SOLD,
            amount: lmsrResult.payout,
            marketId: market.id,
            betId: betId,
            description: `Sold ${sharesToSell.toFixed(2)} ${bet.outcome} shares for ${lmsrResult.payout} tokens`,
          },
        });

        // 7. Update market shares (atomically)
        await tx.market.update({
          where: { id: market.id },
          data: {
            sharesYes: lmsrResult.newQYes,
            sharesNo: lmsrResult.newQNo,
          },
        });

        return {
          payout: lmsrResult.payout,
          sharesSold: sharesToSell,
          newProbability: lmsrResult.newProbability,
          newBalance: updatedUser.tokenBalance,
        };
      }, {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      });
    }, {
      maxRetries: 3,
      delayMs: 50,
      backoffMultiplier: 2,
    });

    return NextResponse.json({
      success: true,
      payout: result.payout,
      sharesSold: result.sharesSold,
      newProbability: result.newProbability,
      newBalance: result.newBalance,
    });

  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error;
    }
    return handleError(error);
  }
}
