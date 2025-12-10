'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

interface SellSharesParams {
  marketId: string;
  outcome: 'YES' | 'NO';
  shares: number; // Required, not optional
}

export function useSell() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({ marketId, outcome, shares }: SellSharesParams) => {
      const response = await fetch('/api/bets/sell', {
        method: 'POST',
        headers: getTelegramAuthHeaders(),
        body: JSON.stringify({
          marketId,
          outcome,
          shares,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sell shares');
      }

      return response.json();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['market'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      
      // Show detailed success message with effective price
      const profit = (data.effectivePrice - 0) * data.sharesSold - (data.payout * 0); // Simplified - would need average cost
      success(
        `Sold ${data.sharesSold.toFixed(2)} ${variables.outcome} shares at ${data.effectivePrice.toFixed(2)} for ${data.payout.toFixed(2)} tokens`
      );
    },
  });
}
