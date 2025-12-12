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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/49efe74e-58fa-4301-bd61-e7414a2ae428',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/use-bet.ts:66',message:'Bet success - before invalidation',data:{marketId:variables.marketId,newProbability:data.newProbability},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Invalidate and refetch - use exact: false to match all markets queries regardless of chatId/status
      queryClient.invalidateQueries({ queryKey: ['market', variables.marketId] });
      queryClient.invalidateQueries({ queryKey: ['markets'], exact: false }); // Match all ['markets', ...] queries
      queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      queryClient.invalidateQueries({ queryKey: ['bets', variables.marketId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] }); // Update portfolio stats (totalInvested changes)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/49efe74e-58fa-4301-bd61-e7414a2ae428',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/use-bet.ts:74',message:'Bet success - after invalidation',data:{marketId:variables.marketId,invalidatedMarkets:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      success(`Bet placed successfully!`);
    },
  });
}

