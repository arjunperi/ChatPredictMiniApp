import Link from 'next/link';
import { Bet } from '@/types/bet';
import { Market } from '@/types/market';

interface PositionCardProps {
  bet: Bet;
  market: Market;
  currentProbabilityYes: number;
}

export function PositionCard({
  bet,
  market,
  currentProbabilityYes,
}: PositionCardProps) {
  const currentProbability =
    bet.outcome === 'YES' ? currentProbabilityYes : 1 - currentProbabilityYes;
  const priceChange = currentProbability - bet.priceAtBet;
  const estimatedValue = bet.shares * currentProbability;
  const pnl = estimatedValue - bet.amount;

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
                  bet.outcome === 'YES'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {bet.outcome}
              </span>
              <span className="text-xs text-slate-400">
                {bet.shares.toFixed(2)} shares
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700">
          <div>
            <div className="text-xs text-slate-400 mb-1">Invested</div>
            <div className="text-white font-medium">{bet.amount} 🪙</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Current Value</div>
            <div className="text-white font-medium">
              {estimatedValue.toFixed(0)} 🪙
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Price Change</div>
            <div
              className={`font-medium ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {priceChange >= 0 ? '+' : ''}
              {(priceChange * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">P&L</div>
            <div
              className={`font-bold ${
                pnl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {pnl >= 0 ? '+' : ''}
              {pnl.toFixed(0)} 🪙
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

