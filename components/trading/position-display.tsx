import { Bet } from '@/types/bet';

interface PositionDisplayProps {
  positions: {
    yes: Bet[];
    no: Bet[];
  };
  currentProbabilityYes: number;
  onSell?: (betId: string) => void;
}

export function PositionDisplay({
  positions,
  currentProbabilityYes,
  onSell,
}: PositionDisplayProps) {
  const totalYesShares = positions.yes.reduce((sum, bet) => sum + bet.shares, 0);
  const totalNoShares = positions.no.reduce((sum, bet) => sum + bet.shares, 0);
  const totalYesCost = positions.yes.reduce((sum, bet) => sum + bet.amount, 0);
  const totalNoCost = positions.no.reduce((sum, bet) => sum + bet.amount, 0);

  if (totalYesShares === 0 && totalNoShares === 0) {
    return null;
  }

  // Calculate current value (simplified - would need LMSR calculation for accurate value)
  const yesValue = totalYesShares * currentProbabilityYes;
  const noValue = totalNoShares * (1 - currentProbabilityYes);
  const totalValue = yesValue + noValue;
  const totalCost = totalYesCost + totalNoCost;
  const pnl = totalValue - totalCost;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Your Position</h3>
      
      <div className="space-y-3">
        {totalYesShares > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">YES Shares</div>
              <div className="text-xs text-slate-400">
                {totalYesShares.toFixed(2)} shares • {totalYesCost.toLocaleString()} 🪙 invested
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                {Math.round(currentProbabilityYes * 100)}%
              </div>
              <div className="text-xs text-slate-400">current price</div>
            </div>
          </div>
        )}

        {totalNoShares > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">NO Shares</div>
              <div className="text-xs text-slate-400">
                {totalNoShares.toFixed(2)} shares • {totalNoCost.toLocaleString()} 🪙 invested
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                {Math.round((1 - currentProbabilityYes) * 100)}%
              </div>
              <div className="text-xs text-slate-400">current price</div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Estimated Value</span>
            <span className="text-white font-bold">
              {totalValue.toFixed(0)} 🪙
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-slate-400">P&L</span>
            <span
              className={`font-bold ${
                pnl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {pnl >= 0 ? '+' : ''}
              {pnl.toFixed(0)} 🪙
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

