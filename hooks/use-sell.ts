'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

interface SellSharesParams {
  betId: string;
  shares?: number;
}

export function useSell() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({ betId, shares }: SellSharesParams) => {
      const response = await fetch('/api/bets/sell', {
        method: 'POST',
        headers: getTelegramAuthHeaders(),
        body: JSON.stringify({
          betId,
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
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['market'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      
      success(`Shares sold successfully! Received ${data.payout} tokens.`);
    },
  });
}

