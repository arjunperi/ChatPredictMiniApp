'use client';

import { useQuery } from '@tanstack/react-query';
import { PortfolioSummary } from '@/components/portfolio/portfolio-summary';
import { PositionsList } from '@/components/portfolio/positions-list';
import { TransactionHistory } from '@/components/portfolio/transaction-history';
import { LoadingPage } from '@/components/ui/loading';
import { useMarkets } from '@/hooks/use-markets';
import { useBets } from '@/hooks/use-bets';
import { getTelegramAuthHeaders } from '@/lib/telegram/utils';
import { AddTokensButton } from '@/components/admin/add-tokens-button';

// Get real portfolio data from API
async function getPortfolioData() {
  try {
    // Check if Telegram WebApp is available
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      console.warn('[Portfolio] Telegram WebApp not available, skipping balance fetch');
      return {
        balance: 0,
        activePositions: 0,
        totalInvested: 0,
        totalReturns: 0,
        netPL: 0,
        transactions: [],
      };
    }
    
    // Wait a bit if Telegram isn't ready yet
    if (!window.Telegram.WebApp.initData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!window.Telegram.WebApp.initData) {
        console.warn('[Portfolio] Telegram initData not available');
        return {
          balance: 0,
          activePositions: 0,
          totalInvested: 0,
          totalReturns: 0,
          netPL: 0,
          transactions: [],
        };
      }
    }
    
    // Get user stats from API (includes balance, activePositions, etc.)
    const statsResponse = await fetch('/api/user/stats', {
      headers: getTelegramAuthHeaders(),
    });
    
    if (!statsResponse.ok) {
      console.error('[Portfolio] Failed to fetch stats:', statsResponse.status);
      return {
        balance: 0,
        activePositions: 0,
        totalInvested: 0,
        totalReturns: 0,
        netPL: 0,
        transactions: [],
      };
    }
    
    const statsData = await statsResponse.json();
    const stats = statsData.stats || {
      balance: 0,
      activePositions: 0,
      totalInvested: 0,
      totalReturns: 0,
      netPL: 0,
    };
    
    // TODO: Fetch transactions from API
    return {
      ...stats,
      transactions: [], // TODO: Fetch from API
    };
  } catch (error) {
    console.error('[Portfolio] Error fetching portfolio data:', error);
    return {
      balance: 0,
      activePositions: 0,
      totalInvested: 0,
      totalReturns: 0,
      netPL: 0,
      transactions: [],
    };
  }
}

export default function PortfolioPage() {
  // Only fetch portfolio data if Telegram WebApp is available
  const isTelegramAvailable = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolioData,
    enabled: isTelegramAvailable, // Only fetch in Telegram context
  });

  // Add separate balance query using same key as navigation/market detail pages
  // This ensures portfolio balance stays in sync with other balance displays
  const { data: balanceData } = useQuery({
    queryKey: ['user-balance'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/balance', {
          headers: getTelegramAuthHeaders(),
        });
        if (!response.ok) {
          return { balance: 0 };
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('[Portfolio] Error fetching balance:', error);
        return { balance: 0 };
      }
    },
    enabled: isTelegramAvailable,
  });

  const { data: markets } = useMarkets();
  const { data: bets } = useBets();

  if (portfolioLoading) {
    return <LoadingPage />;
  }

  // TODO: Get actual transactions from API
  const transactions: any[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Portfolio</h1>
        <AddTokensButton />
      </div>

      <PortfolioSummary
        balance={balanceData?.balance ?? portfolioData?.balance ?? 0}
        activePositions={portfolioData?.activePositions || 0}
        totalInvested={portfolioData?.totalInvested || 0}
        totalReturns={portfolioData?.totalReturns || 0}
        netPL={portfolioData?.netPL || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Active Positions</h2>
          <PositionsList
            bets={bets || []}
            markets={markets || []}
            isLoading={!bets || !markets}
          />
        </div>

        <div>
          <TransactionHistory
            transactions={transactions}
            isLoading={portfolioLoading}
          />
        </div>
      </div>
    </div>
  );
}

