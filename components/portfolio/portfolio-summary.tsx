import { StatsCard } from '@/components/dashboard/stats-card';

interface PortfolioSummaryProps {
  balance: number;
  activePositions: number;
  totalInvested: number;
  totalReturns: number;
  netPL: number;
}

export function PortfolioSummary({
  balance,
  activePositions,
  totalInvested,
  totalReturns,
  netPL,
}: PortfolioSummaryProps) {
  const roi = totalInvested > 0 ? (netPL / totalInvested) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="Token Balance"
        value={balance.toLocaleString()}
        icon="🪙"
        subtitle="Available tokens"
      />
      <StatsCard
        title="Active Positions"
        value={activePositions}
        icon="📊"
        subtitle="Open markets"
      />
      <StatsCard
        title="Total Invested"
        value={totalInvested.toLocaleString()}
        icon="💰"
        subtitle="Tokens invested"
      />
      <StatsCard
        title="Net P&L"
        value={`${netPL >= 0 ? '+' : ''}${netPL.toLocaleString()}`}
        icon="📈"
        subtitle={`${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI`}
        trend={
          netPL !== 0
            ? {
                value: Math.abs(roi),
                isPositive: netPL >= 0,
              }
            : undefined
        }
      />
    </div>
  );
}

