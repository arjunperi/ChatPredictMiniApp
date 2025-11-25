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

      const response = await fetch(`/api/markets?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }
      const data: MarketsResponse = await response.json();
      return data.markets;
    },
    enabled: true, // Always enabled, chatId can be null/undefined
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

