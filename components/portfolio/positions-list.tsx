'use client';

import { Bet } from '@/types/bet';
import { Market } from '@/types/market';
import { PositionCard } from './position-card';
import { SkeletonList } from '@/components/ui/skeleton';
import { LMSR } from '@/lib/lmsr';

interface PositionsListProps {
  bets: Bet[];
  markets: Market[];
  isLoading?: boolean;
}

export function PositionsList({
  bets,
  markets,
  isLoading,
}: PositionsListProps) {
  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  if (bets.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
        <p className="text-slate-400 text-lg mb-4">No active positions</p>
        <p className="text-slate-500 text-sm">
          Start trading to see your positions here
        </p>
      </div>
    );
  }

  // Create a map of markets for quick lookup
  const marketMap = new Map(markets.map((m) => [m.id, m]));

  // Filter bets that have active markets
  const activeBets = bets.filter((bet) => {
    const market = marketMap.get(bet.marketId);
    return market && market.status === 'ACTIVE';
  });

  if (activeBets.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
        <p className="text-slate-400 text-lg mb-4">No active positions</p>
        <p className="text-slate-500 text-sm">
          All your positions are in resolved or closed markets
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeBets.map((bet) => {
        const market = marketMap.get(bet.marketId);
        if (!market) return null;

        const lmsr = new LMSR(market.liquidity);
        const currentProbabilityYes =
          market.probabilityYes ||
          lmsr.getProbability(market.sharesYes, market.sharesNo);

        return (
          <PositionCard
            key={bet.id}
            bet={bet}
            market={market}
            currentProbabilityYes={currentProbabilityYes}
          />
        );
      })}
    </div>
  );
}

