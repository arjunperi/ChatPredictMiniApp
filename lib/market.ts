import { prisma } from './db/prisma';
import { MarketStatus, Outcome, TransactionType } from '@prisma/client';
import { LMSR } from './lmsr';
import { addTokens } from './tokens';

/**
 * Create a new prediction market
 */
export async function createMarket(
  question: string,
  creatorTelegramId: string,
  chatId: string,
  liquidity: number = 100,
  closesAt: Date | null = null
) {
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { telegramId: creatorTelegramId },
  });

  if (!user) {
    throw new Error('User not found. Please use /start first.');
  }

  // Create market
  const market = await prisma.market.create({
    data: {
      question,
      creatorId: user.id,
      chatId,
      liquidity,
      sharesYes: 0,
      sharesNo: 0,
      status: MarketStatus.ACTIVE,
      closesAt,
    },
    include: {
      creator: true,
    },
  });

  return market;
}

/**
 * Get market by ID
 */
export async function getMarketById(marketId: string) {
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: {
      creator: true,
      bets: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return market;
}

/**
 * Get active markets for a chat
 */
export async function getActiveMarkets(chatId: string) {
  const markets = await prisma.market.findMany({
    where: {
      chatId,
      status: MarketStatus.ACTIVE,
    },
    include: {
      creator: true,
      _count: {
        select: { bets: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return markets;
}

/**
 * Get all markets with optional filters
 */
export async function getMarkets(filters?: {
  chatId?: string;
  status?: MarketStatus;
  limit?: number;
  offset?: number;
}) {
  const { chatId, status, limit = 50, offset = 0 } = filters || {};

  const markets = await prisma.market.findMany({
    where: {
      ...(chatId && { chatId }),
      ...(status && { status }),
    },
    include: {
      creator: true,
      _count: {
        select: { bets: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return markets;
}

/**
 * Update market shares after a bet
 */
export async function updateMarketShares(
  marketId: string,
  newSharesYes: number,
  newSharesNo: number
) {
  const market = await prisma.market.update({
    where: { id: marketId },
    data: {
      sharesYes: newSharesYes,
      sharesNo: newSharesNo,
    },
  });

  return market;
}

/**
 * Get user's position in a specific market
 */
export async function getUserPosition(userTelegramId: string, marketId: string) {
  const user = await prisma.user.findUnique({
    where: { telegramId: userTelegramId },
  });

  if (!user) {
    return { yesShares: 0, noShares: 0, totalSpent: 0 };
  }

  const bets = await prisma.bet.findMany({
    where: {
      userId: user.id,
      marketId,
    },
  });

  const yesShares = bets
    .filter(b => b.outcome === Outcome.YES)
    .reduce((sum, b) => sum + b.shares, 0);

  const noShares = bets
    .filter(b => b.outcome === Outcome.NO)
    .reduce((sum, b) => sum + b.shares, 0);

  const totalSpent = bets.reduce((sum, b) => sum + b.amount, 0);

  return {
    yesShares: Math.max(0, yesShares),
    noShares: Math.max(0, noShares),
    totalSpent,
  };
}

/**
 * Sell shares back to the AMM
 */
export async function sellShares(
  userTelegramId: string,
  marketId: string,
  outcome: Outcome,
  sharesToSell: number
) {
  // Get market
  const market = await getMarketById(marketId);
  if (!market) {
    throw new Error('Market not found');
  }

  if (market.status !== MarketStatus.ACTIVE) {
    throw new Error('Market is not active');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { telegramId: userTelegramId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get user's position in this market
  const userBets = await prisma.bet.findMany({
    where: {
      userId: user.id,
      marketId,
      outcome,
    },
  });

  const totalUserShares = userBets.reduce((sum, bet) => sum + bet.shares, 0);

  if (totalUserShares < sharesToSell) {
    throw new Error(
      `Insufficient shares. You have ${totalUserShares.toFixed(2)} ${outcome} shares`
    );
  }

  // Calculate payout using LMSR
  const lmsr = new LMSR(market.liquidity);
  let result;

  if (outcome === Outcome.YES) {
    result = lmsr.sellYes(market.sharesYes, market.sharesNo, sharesToSell);
  } else {
    result = lmsr.sellNo(market.sharesYes, market.sharesNo, sharesToSell);
  }

  // Update market shares
  await updateMarketShares(marketId, result.newQYes, result.newQNo);

  // Give user their payout
  await addTokens(
    user.id,
    result.payout,
    TransactionType.SHARES_SOLD,
    marketId,
    undefined,
    `Sold ${sharesToSell.toFixed(2)} ${outcome} shares for ${result.payout} tokens`
  );

  // Record the sell as a negative bet (for tracking)
  await prisma.bet.create({
    data: {
      userId: user.id,
      marketId,
      outcome,
      amount: -result.payout, // negative because they received tokens
      shares: -sharesToSell, // negative shares
      priceAtBet: result.newProbability,
    },
  });

  return {
    payout: result.payout,
    sharesSold: sharesToSell,
    newProbability: result.newProbability,
    market,
  };
}

