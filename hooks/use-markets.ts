'use client';

import { useQuery } from '@tanstack/react-query';
import { MarketsResponse, MarketResponse } from '@/types/api';

export function useMarkets(chatId?: string | null, status?: string) {
  return useQuery({
    queryKey: ['markets', chatId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (chatId) params.append('chatId', chatId);
      if (status) params.append('status', status);

      const url = `/api/markets?${params}`;
      console.log('[useMarkets] Starting fetch:', url);
      console.log('[useMarkets] Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
      
      try {
        const response = await fetch(url);
        console.log('[useMarkets] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useMarkets] Error response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
          throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
        }
        
        const data: MarketsResponse = await response.json();
        console.log('[useMarkets] Success! Markets count:', data.markets?.length || 0);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/49efe74e-58fa-4301-bd61-e7414a2ae428',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/use-markets.ts:32',message:'Markets fetched from API',data:{marketCount:data.markets?.length||0,firstMarketHasProbability:data.markets?.[0]?.probabilityYes!==undefined,firstMarketProbability:data.markets?.[0]?.probabilityYes,firstMarketShares:data.markets?.[0]?{sharesYes:data.markets[0].sharesYes,sharesNo:data.markets[0].sharesNo,liquidity:data.markets[0].liquidity}:null,allMarketsHaveProbability:data.markets?.every(m=>m.probabilityYes!==undefined)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return data.markets;
      } catch (error) {
        console.error('[useMarkets] Fetch error:', error);
        throw error;
      }
    },
    enabled: true, // Always enabled, chatId can be null/undefined
    retry: 1,
    retryDelay: 1000,
  });
}

export function useMarket(id: string) {
  return useQuery({
    queryKey: ['market', id],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market');
      }
      const data: MarketResponse = await response.json();
      return data;
    },
    enabled: !!id,
  });
}

