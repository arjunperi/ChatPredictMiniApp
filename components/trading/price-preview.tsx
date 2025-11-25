interface PricePreviewProps {
  amount: number;
  cost: number;
  shares: number;
  newProbability: number;
  outcome: 'YES' | 'NO';
  currentProbability: number;
}

export function PricePreview({
  amount,
  cost,
  shares,
  newProbability,
  outcome,
  currentProbability,
}: PricePreviewProps) {
  if (amount === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Enter an amount to see preview</p>
      </div>
    );
  }

  const probabilityChange = newProbability - currentProbability;
  const probabilityChangePercent = Math.abs(probabilityChange * 100);

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Trade Preview</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Cost</div>
          <div className="text-white font-bold">{cost.toLocaleString()} 🪙</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Shares</div>
          <div className="text-white font-bold">{shares.toFixed(2)}</div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Current {outcome} Probability</span>
          <span className="text-white font-medium">
            {Math.round(currentProbability * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">New {outcome} Probability</span>
          <span className="text-white font-bold">
            {Math.round(newProbability * 100)}%
          </span>
        </div>
        {probabilityChange !== 0 && (
          <div className="mt-2 text-xs">
            <span
              className={
                probabilityChange > 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }
            >
              {probabilityChange > 0 ? '↑' : '↓'} {probabilityChangePercent.toFixed(1)}%
            </span>
            <span className="text-slate-500 ml-1">change</span>
          </div>
        )}
      </div>
    </div>
  );
}

