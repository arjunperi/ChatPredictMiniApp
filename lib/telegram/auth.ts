import crypto from 'crypto';
import { TelegramUser } from './types';

/**
 * Verify Telegram WebApp initData signature
 * @param initData - The initData string from Telegram WebApp
 * @param botToken - Telegram bot token
 * @returns true if signature is valid
 */
export function verifyTelegramWebAppData(
  initData: string,
  botToken: string
): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    // Remove hash from params for verification
    urlParams.delete('hash');
    
    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return false;
  }
}

/**
 * Parse Telegram user from initData
 * @param initData - The initData string from Telegram WebApp
 * @returns TelegramUser or null if invalid
 */
export function parseTelegramUser(initData: string): TelegramUser | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return null;
    }

    const user = JSON.parse(userParam) as TelegramUser;
    return user;
  } catch (error) {
    console.error('Error parsing Telegram user:', error);
    return null;
  }
}

/**
 * Extract telegramId from initData
 * @param initData - The initData string from Telegram WebApp
 * @returns telegramId as string or null if invalid
 */
export function getTelegramIdFromInitData(initData: string): string | null {
  const user = parseTelegramUser(initData);
  return user ? user.id.toString() : null;
}

/**
 * Verify and extract user from Telegram initData
 * @param initData - The initData string from Telegram WebApp
 * @param botToken - Telegram bot token
 * @returns TelegramUser if valid, null otherwise
 */
export function verifyAndExtractUser(
  initData: string,
  botToken: string
): TelegramUser | null {
  if (!verifyTelegramWebAppData(initData, botToken)) {
    return null;
  }

  return parseTelegramUser(initData);
}

/**
 * Get initData from request headers
 * @param headers - Request headers
 * @returns initData string or null
 */
export function getInitDataFromHeaders(headers: Headers): string | null {
  // Check for X-Telegram-Init-Data header (custom header)
  const initData = headers.get('x-telegram-init-data');
  if (initData) {
    return initData;
  }

  // Also check for standard header format
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Telegram ')) {
    return authHeader.substring(10);
  }

  return null;
}

