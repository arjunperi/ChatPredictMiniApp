import { NextRequest, NextResponse } from 'next/server';
import { requireTelegramAuth } from '@/lib/telegram/middleware';
import { getOrCreateUser, addTokens } from '@/lib/tokens';
import { handleError } from '@/lib/errors/handlers';
import { TransactionType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const telegramUser = await requireTelegramAuth(request);
    const userTelegramId = telegramUser.id.toString();
    
    const body = await request.json();
    const { amount } = body;
    
    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }
    
    // Maximum amount for testing (prevent abuse)
    const MAX_TEST_AMOUNT = 10000;
    if (amount > MAX_TEST_AMOUNT) {
      return NextResponse.json(
        { error: `Maximum amount is ${MAX_TEST_AMOUNT} tokens for testing.` },
        { status: 400 }
      );
    }
    
    console.log('[Add Tokens API] Adding tokens:', {
      telegramId: userTelegramId,
      amount,
    });
    
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
    
    // Add tokens
    const updatedUser = await addTokens(
      user.id,
      amount,
      TransactionType.INITIAL_GRANT, // Using INITIAL_GRANT for now, could add TOKEN_PURCHASE later
      undefined,
      undefined,
      `Test token addition: +${amount} tokens`
    );
    
    console.log('[Add Tokens API] Tokens added successfully:', {
      userId: user.id,
      oldBalance: user.tokenBalance,
      newBalance: updatedUser.tokenBalance,
      amountAdded: amount,
    });
    
    return NextResponse.json({
      success: true,
      balance: updatedUser.tokenBalance,
      amountAdded: amount,
    });
  } catch (error: any) {
    console.error('[Add Tokens API] Error:', error);
    
    // Handle NextResponse errors (from requireTelegramAuth)
    if (error instanceof NextResponse) {
      return error;
    }
    
    return handleError(error);
  }
}

