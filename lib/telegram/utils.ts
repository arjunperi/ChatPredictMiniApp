/**
 * Utility functions for Telegram Mini App
 */

/**
 * Get chatId from URL parameter (for testing or manual override)
 * Format: ?chatId=123456789
 */
export function getChatIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('chatId');
}

/**
 * Get chatId from Telegram WebApp start_param
 * This is set when the Mini App is opened from a group via a button
 */
/**
 * Get Telegram initData string for API authentication
 */
export function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;
  
  const initData = window.Telegram?.WebApp?.initData || null;
  
  // Log for debugging
  if (typeof window !== 'undefined') {
    console.log('[Telegram Utils] initData check:', {
      hasTelegram: !!window.Telegram,
      hasWebApp: !!window.Telegram?.WebApp,
      hasInitData: !!initData,
      initDataLength: initData?.length || 0,
    });
  }
  
  return initData;
}

/**
 * Get headers with Telegram authentication for API requests
 */
export function getTelegramAuthHeaders(): HeadersInit {
  const initData = getTelegramInitData();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
    console.log('[Telegram Utils] Auth headers created with initData');
  } else {
    console.warn('[Telegram Utils] No initData available - auth headers will be missing!', {
      hasWindow: typeof window !== 'undefined',
      hasTelegram: typeof window !== 'undefined' && !!window.Telegram,
      hasWebApp: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
    });
  }
  
  return headers;
}

export function getChatIdFromStartParam(): string | null {
  if (typeof window === 'undefined') return null;
  const tg = window.Telegram?.WebApp;
  const startParam = tg?.initDataUnsafe?.start_param;
  
  if (startParam && /^-?\d+$/.test(startParam)) {
    return startParam;
  }
  
  return null;
}

/**
 * Get all possible chatId sources
 * Priority: URL param > start_param > null
 */
export function getAllChatIdSources(): {
  url: string | null;
  startParam: string | null;
  final: string | null;
} {
  const url = getChatIdFromUrl();
  const startParam = getChatIdFromStartParam();
  
  return {
    url,
    startParam,
    final: url || startParam || null,
  };
}

