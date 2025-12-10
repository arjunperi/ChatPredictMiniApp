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
    
    // Get balance from API
    const balanceResponse = await fetch('/api/balance', {
      headers: getTelegramAuthHeaders(),
    });
    
    if (!balanceResponse.ok) {
      console.error('[Portfolio] Failed to fetch balance:', balanceResponse.status);
      return {
        balance: 0,
        activePositions: 0,
        totalInvested: 0,
        totalReturns: 0,
        netPL: 0,
        transactions: [],
      };
    }
    
    const balanceData = await balanceResponse.json();
    const balance = balanceData.balance || 0;
    
    // TODO: Calculate activePositions, totalInvested, totalReturns, netPL from bets
    // TODO: Fetch transactions from API
    return {
      balance,
      activePositions: 0, // TODO: Calculate from user's bets
      totalInvested: 0,   // TODO: Calculate from user's bets
      totalReturns: 0,    // TODO: Calculate from user's bets
      netPL: 0,           // TODO: Calculate from user's bets
      transactions: [],    // TODO: Fetch from API
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
        balance={portfolioData?.balance || 0}
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

