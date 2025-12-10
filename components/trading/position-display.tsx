'use client';

import { useState } from 'react';
import { Bet } from '@/types/bet';
import { computeBlendedPosition } from '@/lib/positions';

interface PositionDisplayProps {
  positions: {
    yes: Bet[];
    no: Bet[];
  };
  currentProbabilityYes: number;
  marketId: string;
  onSell?: (outcome: 'YES' | 'NO', shares: number) => void;
}

export function PositionDisplay({
  positions,
  currentProbabilityYes,
  marketId,
  onSell,
}: PositionDisplayProps) {
  const [showSellModal, setShowSellModal] = useState<'YES' | 'NO' | null>(null);
  const [sharesToSell, setSharesToSell] = useState('');

  // Calculate blended positions
  const yesPosition = computeBlendedPosition(positions.yes, currentProbabilityYes);
  const noPosition = computeBlendedPosition(positions.no, 1 - currentProbabilityYes);
  const currentProbabilityNo = 1 - currentProbabilityYes;

  if (!yesPosition && !noPosition) {
    return null;
  }

  const handleSellClick = (outcome: 'YES' | 'NO') => {
    setShowSellModal(outcome);
    const position = outcome === 'YES' ? yesPosition : noPosition;
    if (position) {
      setSharesToSell(position.totalShares.toString());
    }
  };

  const handleSellSubmit = (outcome: 'YES' | 'NO') => {
    const shares = parseFloat(sharesToSell);
    if (shares > 0 && onSell) {
      onSell(outcome, shares);
      setShowSellModal(null);
      setSharesToSell('');
    }
  };

  const handleQuickSell = (outcome: 'YES' | 'NO', percentage: number) => {
    const position = outcome === 'YES' ? yesPosition : noPosition;
    if (position && onSell) {
      const shares = position.totalShares * (percentage / 100);
      onSell(outcome, shares);
      setShowSellModal(null);
      setSharesToSell('');
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Your Position</h3>
      
      <div className="space-y-4">
        {yesPosition && (
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-medium">YES Shares</div>
                <div className="text-xs text-slate-400 mt-1">
                  Avg cost: {yesPosition.averageCost.toFixed(2)} 🪙/share
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">
                  {Math.round(currentProbabilityYes * 100)}%
                </div>
                <div className="text-xs text-slate-400">current price</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-slate-400">Total Shares</div>
                <div className="text-white font-medium">{yesPosition.totalShares.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Invested</div>
                <div className="text-white font-medium">{yesPosition.totalCost.toFixed(2)} 🪙</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Estimated Value</div>
                <div className="text-white font-medium">{yesPosition.estimatedValue.toFixed(2)} 🪙</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">P&L</div>
                <div className={`font-medium ${yesPosition.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {yesPosition.pnl >= 0 ? '+' : ''}{yesPosition.pnl.toFixed(2)} 🪙
                </div>
              </div>
            </div>

            {showSellModal === 'YES' ? (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="mb-2">
                  <label className="block text-xs text-slate-300 mb-1">Shares to Sell</label>
                  <input
                    type="number"
                    value={sharesToSell}
                    onChange={(e) => setSharesToSell(e.target.value)}
                    max={yesPosition.totalShares}
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-600 text-white px-3 py-2 rounded text-sm"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    Max: {yesPosition.totalShares.toFixed(2)} shares
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleQuickSell('YES', 25)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => handleQuickSell('YES', 50)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handleQuickSell('YES', 75)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => handleQuickSell('YES', 100)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    All
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSellSubmit('YES')}
                    disabled={!sharesToSell || parseFloat(sharesToSell) <= 0 || parseFloat(sharesToSell) > yesPosition.totalShares}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded"
                  >
                    Sell {sharesToSell || '0'} Shares
                  </button>
                  <button
                    onClick={() => {
                      setShowSellModal(null);
                      setSharesToSell('');
                    }}
                    className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleSellClick('YES')}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded transition-colors"
              >
                Sell YES Shares
              </button>
            )}
          </div>
        )}

        {noPosition && (
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-medium">NO Shares</div>
                <div className="text-xs text-slate-400 mt-1">
                  Avg cost: {noPosition.averageCost.toFixed(2)} 🪙/share
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">
                  {Math.round(currentProbabilityNo * 100)}%
                </div>
                <div className="text-xs text-slate-400">current price</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-slate-400">Total Shares</div>
                <div className="text-white font-medium">{noPosition.totalShares.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Invested</div>
                <div className="text-white font-medium">{noPosition.totalCost.toFixed(2)} 🪙</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Estimated Value</div>
                <div className="text-white font-medium">{noPosition.estimatedValue.toFixed(2)} 🪙</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">P&L</div>
                <div className={`font-medium ${noPosition.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {noPosition.pnl >= 0 ? '+' : ''}{noPosition.pnl.toFixed(2)} 🪙
                </div>
              </div>
            </div>

            {showSellModal === 'NO' ? (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="mb-2">
                  <label className="block text-xs text-slate-300 mb-1">Shares to Sell</label>
                  <input
                    type="number"
                    value={sharesToSell}
                    onChange={(e) => setSharesToSell(e.target.value)}
                    max={noPosition.totalShares}
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-600 text-white px-3 py-2 rounded text-sm"
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    Max: {noPosition.totalShares.toFixed(2)} shares
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleQuickSell('NO', 25)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => handleQuickSell('NO', 50)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handleQuickSell('NO', 75)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => handleQuickSell('NO', 100)}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded"
                  >
                    All
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSellSubmit('NO')}
                    disabled={!sharesToSell || parseFloat(sharesToSell) <= 0 || parseFloat(sharesToSell) > noPosition.totalShares}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded"
                  >
                    Sell {sharesToSell || '0'} Shares
                  </button>
                  <button
                    onClick={() => {
                      setShowSellModal(null);
                      setSharesToSell('');
                    }}
                    className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleSellClick('NO')}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded transition-colors"
              >
                Sell NO Shares
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
