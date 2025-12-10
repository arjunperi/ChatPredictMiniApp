import Link from 'next/link';
import { Market } from '@/types/market';
import { BlendedPosition } from '@/types/position';

interface PositionCardProps {
  market: Market;
  outcome: 'YES' | 'NO';
  position: BlendedPosition;
  currentProbability: number;
}

export function PositionCard({
  market,
  outcome,
  position,
  currentProbability,
}: PositionCardProps) {
  const priceChange = currentProbability - position.averageCost;
  const profitPerShare = currentProbability - position.averageCost;

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1 line-clamp-2">
              {market.question}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  outcome === 'YES'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {outcome}
              </span>
              <span className="text-xs text-slate-400">
                {position.totalShares.toFixed(2)} shares
              </span>
              <span className="text-xs text-slate-400">
                @ {position.averageCost.toFixed(2)} avg
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700">
          <div>
            <div className="text-xs text-slate-400 mb-1">Invested</div>
            <div className="text-white font-medium">{position.totalCost.toFixed(2)} 🪙</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Current Value</div>
            <div className="text-white font-medium">
              {position.estimatedValue.toFixed(2)} 🪙
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Current Price</div>
            <div
              className={`font-medium ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {(currentProbability * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">P&L</div>
            <div
              className={`font-bold ${
                position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {position.pnl >= 0 ? '+' : ''}
              {position.pnl.toFixed(2)} 🪙
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
