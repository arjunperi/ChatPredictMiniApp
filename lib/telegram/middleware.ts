import { NextRequest } from 'next/server';
import {
  getInitDataFromHeaders,
  verifyAndExtractUser,
  getTelegramIdFromInitData,
} from './auth';
import { TelegramUser } from './types';
import { createErrorResponse } from '@/lib/errors/handlers';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Extract and verify Telegram user from request
 * Returns user if valid, null if not authenticated, throws error if invalid
 */
export async function getTelegramUser(
  request: NextRequest
): Promise<TelegramUser | null> {
  const initData = getInitDataFromHeaders(request.headers);

  if (!initData) {
    return null; // No auth provided - might be public endpoint
  }

  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set, skipping verification');
    // In development, allow without verification
    return getTelegramIdFromInitData(initData)
      ? ({ id: parseInt(getTelegramIdFromInitData(initData) || '0') } as TelegramUser)
      : null;
  }

  const user = verifyAndExtractUser(initData, BOT_TOKEN);
  return user;
}

/**
 * Require Telegram authentication
 * Throws error response if not authenticated
 */
export async function requireTelegramAuth(
  request: NextRequest
): Promise<TelegramUser> {
  const user = await getTelegramUser(request);

  if (!user) {
    throw createErrorResponse('Unauthorized: Telegram authentication required', 401);
  }

  return user;
}

/**
 * Get telegramId from request (for backward compatibility)
 */
export async function getTelegramId(request: NextRequest): Promise<string | null> {
  const user = await getTelegramUser(request);
  return user ? user.id.toString() : null;
}

