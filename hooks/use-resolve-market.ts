'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';

interface ResolveMarketParams {
  marketId: string;
  resolution: 'YES' | 'NO';
  resolverTelegramId: string;
}

export function useResolveMarket() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({
      marketId,
      resolution,
      resolverTelegramId,
    }: ResolveMarketParams) => {
      const response = await fetch(`/api/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution,
          resolverTelegramId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resolve market');
      }

      return response.json();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['market', variables.marketId] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      success('Market resolved successfully!');
    },
  });
}

