'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

interface AddTokensParams {
  amount: number;
}

export function useAddTokens() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async ({ amount }: AddTokensParams) => {
      const response = await fetch('/api/tokens/add', {
        method: 'POST',
        headers: getTelegramAuthHeaders(),
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to add tokens';
        console.error('[useAddTokens] Failed:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onMutate: async ({ amount }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-balance'] });
      await queryClient.cancelQueries({ queryKey: ['user-stats'] });
      await queryClient.cancelQueries({ queryKey: ['portfolio'] });

      // Snapshot previous values for rollback
      const previousBalance = queryClient.getQueryData(['user-balance']);
      const previousStats = queryClient.getQueryData(['user-stats']);
      const previousPortfolio = queryClient.getQueryData(['portfolio']);

      // Optimistically update balance
      queryClient.setQueryData(['user-balance'], (old: number | undefined) => {
        return (old || 0) + amount;
      });

      // Optimistically update user stats
      queryClient.setQueryData(['user-stats'], (old: any) => {
        if (!old) return { balance: amount, activePositions: 0, totalInvested: 0, totalReturns: 0, netPL: 0 };
        return { ...old, balance: (old.balance || 0) + amount };
      });

      // Optimistically update portfolio
      queryClient.setQueryData(['portfolio'], (old: any) => {
        if (!old) return { balance: amount, activePositions: 0, totalInvested: 0, totalReturns: 0, netPL: 0, transactions: [] };
        return { ...old, balance: (old.balance || 0) + amount };
      });

      return { previousBalance, previousStats, previousPortfolio };
    },
    onError: (err: Error, variables, context) => {
      // Rollback on error
      if (context?.previousBalance !== undefined) {
        queryClient.setQueryData(['user-balance'], context.previousBalance);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['user-stats'], context.previousStats);
      }
      if (context?.previousPortfolio) {
        queryClient.setQueryData(['portfolio'], context.previousPortfolio);
      }
      showError(err.message);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      
      success(`Added ${variables.amount.toLocaleString()} tokens! New balance: ${data.balance.toLocaleString()}`);
    },
  });
}

