'use client';

import { useQuery } from '@tanstack/react-query';
import { LeaderboardResponse } from '@/types/api';

export function useLeaderboard(chatId?: string, limit: number = 10) {
  return useQuery({
    queryKey: ['leaderboard', chatId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (chatId) params.append('chatId', chatId);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data: LeaderboardResponse = await response.json();
      return data.leaderboard;
    },
  });
}

