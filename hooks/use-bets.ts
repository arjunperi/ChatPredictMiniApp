'use client';

import { useQuery } from '@tanstack/react-query';
import { BetsResponse } from '@/types/api';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

export function useBets(userId?: string, marketId?: string) {
  return useQuery({
    queryKey: ['bets', userId, marketId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (marketId) params.append('marketId', marketId);

      // Include auth headers so API can return current user's bets if no userId provided
      const response = await fetch(`/api/bets?${params}`, {
        headers: getTelegramAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bets');
      }
      const data: BetsResponse = await response.json();
      return data.bets;
    },
  });
}

