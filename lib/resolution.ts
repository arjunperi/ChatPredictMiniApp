import { prisma } from './db/prisma';
import { MarketStatus, Resolution, Outcome, TransactionType } from '@prisma/client';
import { addTokens } from './tokens';

/**
 * Resolve a market and distribute payouts
 */
export async function resolveMarket(
  marketId: string,
  resolution: Resolution,
  resolverTelegramId: string
) {
  // Get market with creator and all bets
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: {
      creator: true,
      bets: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!market) {
    throw new Error('Market not found');
  }

  if (market.status !== MarketStatus.ACTIVE) {
    throw new Error('Market is not active');
  }

  if (market.creator.telegramId !== resolverTelegramId) {
    throw new Error('Only the market creator can resolve this market');
  }

  // Calculate payouts
  const payouts = calculatePayouts(market.bets, resolution);

  // Update market status
  await prisma.market.update({
    where: { id: marketId },
    data: {
      status: MarketStatus.RESOLVED,
      resolution,
      resolvedAt: new Date(),
    },
  });

  // Distribute winnings
  await distributeWinnings(payouts, marketId);

  return {
    market,
    payouts,
  };
}

/**
 * Calculate payouts for all bets based on resolution
 * Each winning share pays out 1 token (LMSR AMM standard)
 */
export function calculatePayouts(
  bets: Array<{
    id: string;
    userId: string;
    outcome: Outcome;
    shares: number;
    amount: number;
  }>,
  resolution: Resolution
): Array<{
  userId: string;
  betId: string;
  amount: number;
  won: boolean;
}> {
  const winningOutcome = resolution === Resolution.YES ? Outcome.YES : Outcome.NO;

  return bets.map((bet) => {
    const won = bet.outcome === winningOutcome;
    // Each winning share pays 1 token
    const payout = won ? Math.round(bet.shares) : 0;

    return {
      userId: bet.userId,
      betId: bet.id,
      amount: payout,
      won,
    };
  });
}

/**
 * Distribute winnings to users
 */
export async function distributeWinnings(
  payouts: Array<{
    userId: string;
    betId: string;
    amount: number;
    won: boolean;
  }>,
  marketId: string
) {
  // Process payouts in parallel
  await Promise.all(
    payouts.map(async (payout) => {
      if (payout.won && payout.amount > 0) {
        await addTokens(
          payout.userId,
          payout.amount,
          TransactionType.BET_WON,
          marketId,
          payout.betId,
          `Won ${payout.amount} tokens from market resolution`
        );
      }
    })
  );
}

