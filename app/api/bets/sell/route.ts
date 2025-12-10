import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { LMSR } from '@/lib/lmsr';
import { retryWithBackoff } from '@/lib/utils/retry';
import { MarketStatus, TransactionType, Outcome } from '@prisma/client';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { handleError } from '@/lib/errors/handlers';
import { getOrCreateUser } from '@/lib/tokens';

/**
 * Round to specified decimal places
 */
function roundToDecimals(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export async function POST(req: NextRequest) {
  try {
    // Require Telegram authentication
    const telegramUser = await requireTelegramAuth(req);
    const userTelegramId = telegramUser.id.toString();

    const body = await req.json();
    const { marketId, outcome, shares } = body;

    // Validation
    if (!marketId) {
      return NextResponse.json(
        { error: 'Missing required field: marketId' },
        { status: 400 }
      );
    }

    if (!outcome || (outcome !== 'YES' && outcome !== 'NO')) {
      return NextResponse.json(
        { error: 'Missing or invalid field: outcome (must be YES or NO)' },
        { status: 400 }
      );
    }

    if (!shares || typeof shares !== 'number' || shares <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid field: shares (must be a positive number)' },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await getOrCreateUser(
      userTelegramId,
      telegramUser.username,
      telegramUser.first_name,
      telegramUser.last_name
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Execute everything in a single transaction with proper locking and retry on conflicts
    const result = await retryWithBackoff(async () => {
      return prisma.$transaction(async (tx) => {
        // 1. Re-read market with lock
        const lockedMarket = await tx.market.findUnique({
          where: { id: marketId },
        });

        if (!lockedMarket) {
          throw new Error('Market not found');
        }

        if (lockedMarket.status !== MarketStatus.ACTIVE) {
          throw new Error('Market is not active');
        }

        // 2. Fetch all user's bets for this market + outcome (sorted by createdAt for stability)
        const userBets = await tx.bet.findMany({
          where: {
            userId: user.id,
            marketId,
            outcome: outcome as Outcome,
          },
          orderBy: { createdAt: 'asc' }, // Stable ordering for deterministic behavior
        });

        if (userBets.length === 0) {
          throw new Error('No positions found for this outcome');
        }

        // 3. Calculate total shares available
        const totalShares = userBets.reduce((sum, b) => sum + b.shares, 0);

        if (totalShares < shares) {
          throw new Error(
            `Insufficient shares. Available: ${totalShares.toFixed(8)}, Requested: ${shares.toFixed(8)}`
          );
        }

        // 4. Calculate proportional reductions with high precision
        const reductions: Array<{ betId: string; shares: number }> = [];
        let totalReduction = 0;

        for (const bet of userBets) {
          const proportion = bet.shares / totalShares;
          const sharesToReduce = shares * proportion;
          const rounded = roundToDecimals(sharesToReduce, 8); // 6-8 decimals for shares

          reductions.push({ betId: bet.id, shares: rounded });
          totalReduction += rounded;
        }

        // 5. Adjust last bet to absorb any rounding difference
        const roundingDiff = shares - totalReduction;
        if (Math.abs(roundingDiff) > 0.00000001) {
          reductions[reductions.length - 1].shares += roundingDiff;
        }

        // 6. Calculate payout using LMSR with total shares being sold
        const lmsr = new LMSR(lockedMarket.liquidity);
        const lmsrResult =
          outcome === 'YES'
            ? lmsr.sellYes(lockedMarket.sharesYes, lockedMarket.sharesNo, shares)
            : lmsr.sellNo(lockedMarket.sharesYes, lockedMarket.sharesNo, shares);

        // 7. Apply proportional reductions to all bets
        for (const { betId, shares } of reductions) {
          await tx.bet.update({
            where: { id: betId },
            data: {
              shares: { decrement: shares },
            },
          });
        }

        // 8. Update user balance
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            tokenBalance: { increment: lmsrResult.payout },
          },
        });

        // 9. Calculate effective sale price
        const effectivePrice = lmsrResult.payout / shares;

        // 10. Create transaction record
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: TransactionType.SHARES_SOLD,
            amount: lmsrResult.payout,
            marketId: marketId,
            description: `Sold ${shares.toFixed(8)} ${outcome} shares at ${effectivePrice.toFixed(2)} for ${lmsrResult.payout.toFixed(2)} tokens`,
          },
        });

        // 11. Update market shares (atomically)
        await tx.market.update({
          where: { id: marketId },
          data: {
            sharesYes: lmsrResult.newQYes,
            sharesNo: lmsrResult.newQNo,
          },
        });

        return {
          payout: lmsrResult.payout,
          sharesSold: shares,
          effectivePrice: effectivePrice,
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
      effectivePrice: result.effectivePrice,
      newProbability: result.newProbability,
      newBalance: result.newBalance,
    });

  } catch (error: any) {
    console.error('[Sell API] Error:', error);
    if (error instanceof NextResponse) {
      return error;
    }
    return handleError(error);
  }
}
