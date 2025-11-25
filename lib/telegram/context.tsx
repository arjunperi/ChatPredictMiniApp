'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAllChatIdSources } from './utils';

interface TelegramContextValue {
  chatId: string | null;
  userId: number | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
  chatId: null,
  userId: null,
  isReady: false,
});

export function useTelegramContext() {
  return useContext(TelegramContext);
}

interface TelegramContextProviderProps {
  children: ReactNode;
}

/**
 * Extract chatId from various sources:
 * 1. URL query parameter (e.g., ?chatId=123) - highest priority
 * 2. start_param from Telegram initData (if app opened from group)
 * 3. Fallback to null (will use user-specific chatId in API)
 */
function extractChatId(): string | null {
  if (typeof window === 'undefined') return null;
  
  const sources = getAllChatIdSources();
  return sources.final;
}

/**
 * Extract userId from Telegram WebApp
 */
function extractUserId(): number | null {
  if (typeof window === 'undefined') return null;
  
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id || null;
}

export function TelegramContextProvider({ children }: TelegramContextProviderProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for Telegram WebApp to initialize
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Extract chatId
        const extractedChatId = extractChatId();
        setChatId(extractedChatId);

        // Extract userId
        const extractedUserId = extractUserId();
        setUserId(extractedUserId);

        setIsReady(true);
      } else {
        // Retry after a short delay
        setTimeout(checkTelegram, 100);
      }
    };

    checkTelegram();
  }, []);

  return (
    <TelegramContext.Provider value={{ chatId, userId, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}

