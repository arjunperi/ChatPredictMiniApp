import { prisma } from './db/prisma';
import { TransactionType } from '@prisma/client';

/**
 * Get or create user, granting initial tokens if new
 */
export async function getOrCreateUser(
  telegramId: string,
  username?: string,
  firstName?: string,
  lastName?: string
) {
  // First check if user exists and if they have initial grant
  const existingUser = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      transactions: {
        where: {
          type: TransactionType.INITIAL_GRANT,
        },
        take: 1,
      },
    },
  });

  if (!existingUser) {
    // Create new user with initial token grant
    const user = await prisma.user.create({
      data: {
        telegramId,
        username,
        firstName,
        lastName,
        tokenBalance: 1000,
        transactions: {
          create: {
            type: TransactionType.INITIAL_GRANT,
            amount: 1000,
            description: 'Initial token grant',
          },
        },
      },
    });
    return user;
  }

  // Check if existing user needs initial grant
  if (existingUser.tokenBalance === 0 && existingUser.transactions.length === 0) {
    // Existing user with 0 balance and no initial grant - grant tokens
    console.log(`[getOrCreateUser] Granting initial tokens to existing user: ${telegramId}`);
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        tokenBalance: 1000,
        transactions: {
          create: {
            type: TransactionType.INITIAL_GRANT,
            amount: 1000,
            description: 'Initial token grant (retroactive)',
          },
        },
      },
    });
    return updatedUser;
  }

  // Return existing user (without transactions relation)
  return existingUser;
}

/**
 * Get user balance
 */
export async function getUserBalance(telegramId: string) {
  const user = await prisma.user.findUnique({
    where: { telegramId },
    select: { tokenBalance: true },
  });

  return user?.tokenBalance || 0;
}

/**
 * Deduct tokens from user
 */
export async function deductTokens(
  userId: string,
  amount: number,
  marketId?: string,
  betId?: string,
  description: string = 'Tokens deducted'
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      tokenBalance: {
        decrement: amount,
      },
      transactions: {
        create: {
          type: TransactionType.BET_PLACED,
          amount: -amount,
          marketId,
          betId,
          description,
        },
      },
    },
  });

  return user;
}

/**
 * Add tokens to user
 */
export async function addTokens(
  userId: string,
  amount: number,
  type: TransactionType = TransactionType.BET_WON,
  marketId?: string,
  betId?: string,
  description: string = 'Tokens added'
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      tokenBalance: {
        increment: amount,
      },
      transactions: {
        create: {
          type,
          amount,
          marketId,
          betId,
          description,
        },
      },
    },
  });

  return user;
}

/**
 * Create a transaction record
 */
export async function createTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  description: string,
  marketId?: string,
  betId?: string
) {
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type,
      amount,
      description,
      marketId,
      betId,
    },
  });

  return transaction;
}

/**
 * Get user with stats
 */
export async function getUserWithStats(telegramId: string) {
  const user = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      _count: {
        select: {
          bets: true,
          marketsCreated: true,
        },
      },
      transactions: {
        where: {
          type: {
            in: [TransactionType.BET_WON, TransactionType.BET_LOST],
          },
        },
      },
    },
  });

  if (!user) return null;

  // Calculate total winnings
  const totalWinnings = user.transactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  return {
    ...user,
    stats: {
      totalBets: user._count.bets,
      marketsCreated: user._count.marketsCreated,
      totalWinnings,
    },
  };
}

