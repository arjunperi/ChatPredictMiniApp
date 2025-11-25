'use client';

import { useQuery } from '@tanstack/react-query';
import { PortfolioSummary } from '@/components/portfolio/portfolio-summary';
import { PositionsList } from '@/components/portfolio/positions-list';
import { TransactionHistory } from '@/components/portfolio/transaction-history';
import { LoadingPage } from '@/components/ui/loading';
import { useMarkets } from '@/hooks/use-markets';
import { useBets } from '@/hooks/use-bets';

// TODO: Replace with actual user context
function getPortfolioData() {
  return Promise.resolve({
    balance: 1000,
    activePositions: 5,
    totalInvested: 5000,
    totalReturns: 5200,
    netPL: 200,
    transactions: [],
  });
}

export default function PortfolioPage() {
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolioData,
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
      <h1 className="text-3xl font-bold text-white mb-8">Portfolio</h1>

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

