'use client';

import { useQuery } from '@tanstack/react-query';
import { BetsResponse } from '@/types/api';

export function useBets(userId?: string, marketId?: string) {
  return useQuery({
    queryKey: ['bets', userId, marketId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (marketId) params.append('marketId', marketId);

      const response = await fetch(`/api/bets?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bets');
      }
      const data: BetsResponse = await response.json();
      return data.bets;
    },
  });
}

