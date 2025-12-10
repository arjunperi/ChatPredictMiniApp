'use client';

import { Bet } from '@/types/bet';
import { Market } from '@/types/market';
import { PositionCard } from './position-card';
import { SkeletonList } from '@/components/ui/skeleton';
import { LMSR } from '@/lib/lmsr';
import { computeBlendedPosition } from '@/lib/positions';

interface PositionsListProps {
  bets: Bet[];
  markets: Market[];
  isLoading?: boolean;
}

interface BlendedPositionCard {
  market: Market;
  outcome: 'YES' | 'NO';
  position: ReturnType<typeof computeBlendedPosition>;
  currentProbability: number;
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

  // Group bets by market + outcome and compute blended positions
  const positionMap = new Map<string, BlendedPositionCard>();

  for (const bet of activeBets) {
    const market = marketMap.get(bet.marketId);
    if (!market) continue;

    const lmsr = new LMSR(market.liquidity);
    const currentProbabilityYes =
      market.probabilityYes ||
      lmsr.getProbability(market.sharesYes, market.sharesNo);

    const key = `${bet.marketId}-${bet.outcome}`;
    
    if (!positionMap.has(key)) {
      const currentProbability = bet.outcome === 'YES' ? currentProbabilityYes : 1 - currentProbabilityYes;
      positionMap.set(key, {
        market,
        outcome: bet.outcome,
        position: null,
        currentProbability,
      });
    }

    const card = positionMap.get(key)!;
    // Collect bets for this position
    const positionBets = activeBets.filter(
      (b) => b.marketId === bet.marketId && b.outcome === bet.outcome
    );
    card.position = computeBlendedPosition(positionBets, card.currentProbability);
  }

  // Convert to array and filter out null positions
  const blendedPositions = Array.from(positionMap.values()).filter(
    (card) => card.position !== null
  );

  if (blendedPositions.length === 0) {
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
      {blendedPositions.map((card) => {
        if (!card.position) return null;

        return (
          <PositionCard
            key={`${card.market.id}-${card.outcome}`}
            market={card.market}
            outcome={card.outcome}
            position={card.position}
            currentProbability={card.currentProbability}
          />
        );
      })}
    </div>
  );
}
