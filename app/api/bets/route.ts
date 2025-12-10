import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { LMSR } from '@/lib/lmsr';
import { validateBetAmount } from '@/lib/utils/validation';
import { retryWithBackoff } from '@/lib/utils/retry';
import { Outcome, MarketStatus } from '@prisma/client';
import { requireTelegramAuth, getTelegramUser } from '@/lib/telegram/middleware';
import { handleError } from '@/lib/errors/handlers';
import { getOrCreateUser } from '@/lib/tokens';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const marketId = searchParams.get('marketId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    // If no userId provided, try to get current user from auth
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const telegramUser = await getTelegramUser(request);
        if (telegramUser) {
          const user = await getOrCreateUser(
            telegramUser.id.toString(),
            telegramUser.username,
            telegramUser.first_name,
            telegramUser.last_name
          );
          if (user) {
            finalUserId = user.id;
          }
        }
      } catch (error) {
        // Auth is optional for GET - if it fails, continue without user filter
        console.log('[Bets API] No auth provided, returning all bets');
      }
    }

    const bets = await prisma.bet.findMany({
      where: {
        ...(finalUserId && { userId: finalUserId }),
        ...(marketId && { marketId }),
      },
      include: {
        user: true,
        market: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ bets });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Telegram authentication
    const telegramUser = await requireTelegramAuth(request);
    const userTelegramId = telegramUser.id.toString();

    const body = await request.json();
    const { marketId, outcome, amount } = body;

    // Validate inputs
    if (!marketId || !outcome || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validation = validateBetAmount(amount);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    if (outcome !== 'YES' && outcome !== 'NO') {
      return NextResponse.json(
        { error: 'Outcome must be YES or NO' },
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
      throw new Error('Failed to get or create user');
    }

    // Execute everything in a single transaction with proper locking and retry on conflicts
    const result = await retryWithBackoff(async () => {
      return prisma.$transaction(async (tx) => {
      // 1. Read market with lock (this prevents concurrent modifications)
      const market = await tx.market.findUnique({
        where: { id: marketId },
        include: {
          creator: true,
        },
      });

      if (!market) {
        throw new Error('Market not found');
      }

      if (market.status !== MarketStatus.ACTIVE) {
        throw new Error('Market is not active');
      }

      // 2. Re-read user balance inside transaction to ensure it's current
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      // 3. Calculate shares using LMSR with locked market state
      const lmsr = new LMSR(market.liquidity);
      const lmsrResult =
        outcome === 'YES'
          ? lmsr.buyYes(market.sharesYes, market.sharesNo, amount)
          : lmsr.buyNo(market.sharesYes, market.sharesNo, amount);

      // 4. Verify user has enough tokens for the actual cost
      console.log('[Bet API] Balance check:', {
        userBalance: currentUser.tokenBalance,
        requestedAmount: amount,
        calculatedCost: lmsrResult.cost,
        shares: lmsrResult.shares,
        sufficient: currentUser.tokenBalance >= lmsrResult.cost,
      });
      
      if (currentUser.tokenBalance < lmsrResult.cost) {
        throw new Error(
          `Insufficient tokens. Balance: ${currentUser.tokenBalance}, Required: ${lmsrResult.cost}, Shortfall: ${lmsrResult.cost - currentUser.tokenBalance}`
        );
      }

      // 5. Create bet
      const newBet = await tx.bet.create({
        data: {
          userId: user.id,
          marketId: market.id,
          outcome: outcome as Outcome,
          amount: lmsrResult.cost,
          shares: lmsrResult.shares,
          priceAtBet: lmsrResult.newProbability,
        },
      });

      // 6. Update user balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          tokenBalance: { decrement: lmsrResult.cost },
        },
      });

      // 7. Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'BET_PLACED',
          amount: -lmsrResult.cost,
          marketId: market.id,
          betId: newBet.id,
          description: `Bet ${lmsrResult.cost} tokens on ${outcome}`,
        },
      });

      // 8. Update market shares (atomically)
      await tx.market.update({
        where: { id: market.id },
        data: {
          sharesYes: lmsrResult.newQYes,
          sharesNo: lmsrResult.newQNo,
        },
      });

        return {
          bet: newBet,
          lmsrResult,
          newBalance: currentUser.tokenBalance - lmsrResult.cost,
        };
      }, {
        isolationLevel: 'Serializable', // Strongest isolation - prevents race conditions
        maxWait: 5000, // Wait up to 5s for lock
        timeout: 10000, // Transaction timeout 10s
      });
    }, {
      maxRetries: 3, // Retry up to 3 times on conflict
      delayMs: 50, // Start with 50ms delay
      backoffMultiplier: 2, // Double delay each time (50ms, 100ms, 200ms)
    });

    return NextResponse.json({
      success: true,
      bet: {
        id: result.bet.id,
        shares: result.lmsrResult.shares,
        priceAtBet: result.lmsrResult.newProbability,
      },
      newProbability: result.lmsrResult.newProbability,
      userBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('Error placing bet:', error);
    
    // Handle specific error cases
    if (error.message === 'Market not found') {
      return NextResponse.json(
        { error: 'Market not found', code: 'MARKET_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Market is not active') {
      return NextResponse.json(
        { error: 'Market is not active', code: 'MARKET_RESOLVED' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('Insufficient tokens')) {
      // Extract the detailed error message if available
      const errorMessage = error.message || 'Insufficient tokens';
      return NextResponse.json(
        { 
          error: errorMessage, 
          code: 'INSUFFICIENT_TOKENS',
          message: errorMessage,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to place bet' },
      { status: 500 }
    );
  }
}

