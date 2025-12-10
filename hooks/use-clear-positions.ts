'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

export function useClearPositions() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/clear-positions', {
        method: 'POST',
        headers: getTelegramAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to clear positions';
        console.error('[useClearPositions] Failed:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      
      success(data.message || 'Positions cleared successfully');
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}

