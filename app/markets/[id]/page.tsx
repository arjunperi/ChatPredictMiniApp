'use client';

import { useMarket } from '@/hooks/use-markets';
import { useBets } from '@/hooks/use-bets';
import { MarketDetail } from '@/components/markets/market-detail';
import { TradingPanel } from '@/components/trading/trading-panel';
import { ResolveModal } from '@/components/markets/resolve-modal';
import { LoadingPage } from '@/components/ui/loading';
import { useBet } from '@/hooks/use-bet';
import { useSell } from '@/hooks/use-sell';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';

async function getUserBalance(): Promise<number> {
  try {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && !window.Telegram?.WebApp) {
      console.warn('[Market Detail] Telegram WebApp not available yet, waiting...');
      // Wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!window.Telegram?.WebApp) {
        console.error('[Market Detail] Telegram WebApp still not available after wait');
        return 0;
      }
    }
    
    const headers = getTelegramAuthHeaders();
    const headersObj = headers as Record<string, string>;
    console.log('[Market Detail] Fetching balance with headers:', {
      hasInitData: !!headersObj['X-Telegram-Init-Data'],
      headerKeys: Object.keys(headersObj),
    });
    
    const response = await fetch('/api/balance', {
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Market Detail] Failed to fetch balance:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return 0;
    }
    const data = await response.json();
    console.log('[Market Detail] Balance fetched successfully:', data.balance);
    return data.balance || 0;
  } catch (error) {
    console.error('[Market Detail] Error fetching balance:', error);
    return 0;
  }
}

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: market, isLoading: marketLoading, error } = useMarket(id);
  const { data: bets } = useBets(id);
  const { data: userBalance } = useQuery({
    queryKey: ['user-balance'],
    queryFn: getUserBalance,
    staleTime: 0, // Always refetch to get latest balance
    refetchOnMount: true,
  });

  const [showResolveModal, setShowResolveModal] = useState(false);
  const betMutation = useBet();
  const sellMutation = useSell();

  const handleBuy = async (outcome: 'YES' | 'NO', amount: number) => {
    if (!market) return;
    await betMutation.mutateAsync({
      marketId: market.id,
      outcome,
      amount,
    });
  };

  const handleSell = async (betId: string, shares?: number) => {
    await sellMutation.mutateAsync({ betId, shares });
  };

  // TODO: Check if current user is the creator
  const isCreator = false;

  if (marketLoading) {
    return <LoadingPage />;
  }

  if (error || !market) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-6 text-red-400">
          <h2 className="text-xl font-bold mb-2">Market not found</h2>
          <p>The market you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Filter user's bets for this market
  const userBets = bets?.filter((bet) => bet.marketId === id) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isCreator && market.status === 'ACTIVE' && (
        <div className="mb-6">
          <button
            onClick={() => setShowResolveModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Resolve Market
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MarketDetail market={market} />
        </div>
        <div>
          <TradingPanel
            market={market}
            userBets={userBets}
            userBalance={userBalance || 0}
            onBuy={handleBuy}
            onSell={handleSell}
            isLoading={betMutation.isPending || sellMutation.isPending}
          />
        </div>
      </div>

      {showResolveModal && (
        <ResolveModal
          market={market}
          isOpen={showResolveModal}
          onClose={() => setShowResolveModal(false)}
        />
      )}
    </div>
  );
}

