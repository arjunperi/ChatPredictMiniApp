'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { Market } from '@/types/market';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

interface PlaceBetParams {
  marketId: string;
  outcome: 'YES' | 'NO';
  amount: number;
}

export function useBet() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({ marketId, outcome, amount }: PlaceBetParams) => {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: getTelegramAuthHeaders(),
        body: JSON.stringify({
          marketId,
          outcome,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show detailed error message if available
        const errorMessage = errorData.message || errorData.error || 'Failed to place bet';
        console.error('[useBet] Bet failed:', {
          status: response.status,
          error: errorData,
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onMutate: async ({ marketId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['market', marketId] });
      await queryClient.cancelQueries({ queryKey: ['markets'] });
      await queryClient.cancelQueries({ queryKey: ['user-balance'] });

      // Snapshot previous values
      const previousMarket = queryClient.getQueryData(['market', marketId]);
      const previousMarkets = queryClient.getQueryData(['markets']);

      return { previousMarket, previousMarkets };
    },
    onError: (err: Error, variables, context) => {
      // Rollback on error
      if (context?.previousMarket) {
        queryClient.setQueryData(['market', variables.marketId], context.previousMarket);
      }
      if (context?.previousMarkets) {
        queryClient.setQueryData(['markets'], context.previousMarkets);
      }
      showError(err.message);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['market', variables.marketId] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['bets', variables.marketId] });
      
      success(`Bet placed successfully!`);
    },
  });
}

