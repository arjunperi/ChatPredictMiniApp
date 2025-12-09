'use client';

import { useQuery } from '@tanstack/react-query';
import { MarketsResponse, MarketResponse } from '@/types/api';

export function useMarkets(chatId?: string | null, status?: string) {
  return useQuery({
    queryKey: ['markets', chatId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (chatId) params.append('chatId', chatId);
      if (status) params.append('status', status);

      const url = `/api/markets?${params}`;
      console.log('[useMarkets] Starting fetch:', url);
      console.log('[useMarkets] Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
      
      try {
        const response = await fetch(url);
        console.log('[useMarkets] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useMarkets] Error response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
          throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
        }
        
        const data: MarketsResponse = await response.json();
        console.log('[useMarkets] Success! Markets count:', data.markets?.length || 0);
        return data.markets;
      } catch (error) {
        console.error('[useMarkets] Fetch error:', error);
        throw error;
      }
    },
    enabled: true, // Always enabled, chatId can be null/undefined
    retry: 1,
    retryDelay: 1000,
  });
}

export function useMarket(id: string) {
  return useQuery({
    queryKey: ['market', id],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market');
      }
      const data: MarketResponse = await response.json();
      return data;
    },
    enabled: !!id,
  });
}

