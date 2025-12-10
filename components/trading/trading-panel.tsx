'use client';

import { useState, useEffect, useMemo } from 'react';
import { Market } from '@/types/market';
import { Bet } from '@/types/bet';
import { LMSR } from '@/lib/lmsr';
import { BuySellTabs } from './buy-sell-tabs';
import { AmountInput } from './amount-input';
import { PricePreview } from './price-preview';
import { PositionDisplay } from './position-display';

interface TradingPanelProps {
  market: Market;
  userBets?: Bet[];
  userBalance?: number;
  onBuy: (outcome: 'YES' | 'NO', amount: number) => Promise<void>;
  onSell: (betId: string, shares?: number) => Promise<void>;
  isLoading?: boolean;
}

export function TradingPanel({
  market,
  userBets = [],
  userBalance = 0,
  onBuy,
  onSell,
  isLoading = false,
}: TradingPanelProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES');
  const [amount, setAmount] = useState(0);

  const lmsr = useMemo(() => new LMSR(market.liquidity), [market.liquidity]);
  const currentProbabilityYes = market.probabilityYes || lmsr.getProbability(market.sharesYes, market.sharesNo);
  const currentProbabilityNo = 1 - currentProbabilityYes;

  // Group user bets by outcome
  const userPositions = useMemo(() => {
    const yes = userBets.filter((bet) => bet.outcome === 'YES');
    const no = userBets.filter((bet) => bet.outcome === 'NO');
    return { yes, no };
  }, [userBets]);

  const hasPosition = userBets.length > 0;

  // Calculate price preview for buy
  const buyPreview = useMemo(() => {
    if (amount === 0 || activeTab !== 'buy') {
      return null;
    }

    try {
      const result =
        outcome === 'YES'
          ? lmsr.buyYes(market.sharesYes, market.sharesNo, amount)
          : lmsr.buyNo(market.sharesYes, market.sharesNo, amount);

      return {
        cost: result.cost,
        shares: result.shares,
        newProbability: result.newProbability,
      };
    } catch (error) {
      return null;
    }
  }, [amount, outcome, activeTab, market, lmsr]);

  const handleBuy = async () => {
    if (amount <= 0 || !buyPreview) return;
    await onBuy(outcome, amount);
    setAmount(0);
  };

  const handleSell = async (betId: string) => {
    await onSell(betId);
  };

  if (market.status !== 'ACTIVE') {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p className="text-slate-400 text-center">
          This market is {market.status.toLowerCase()} and cannot be traded.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-6">Trade</h2>

      {/* Position Display */}
      {hasPosition && (
        <PositionDisplay
          positions={userPositions}
          currentProbabilityYes={currentProbabilityYes}
          onSell={handleSell}
        />
      )}

      {/* Buy/Sell Tabs */}
      <BuySellTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPosition={hasPosition}
      />

      {activeTab === 'buy' ? (
        <>
          {/* Outcome Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Choose Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOutcome('YES')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  outcome === 'YES'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                YES ({Math.round(currentProbabilityYes * 100)}%)
              </button>
              <button
                onClick={() => setOutcome('NO')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  outcome === 'NO'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                NO ({Math.round(currentProbabilityNo * 100)}%)
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <AmountInput
            value={amount}
            onChange={setAmount}
            max={userBalance}
            label="Amount (tokens)"
            placeholder="Enter amount to invest"
          />

          {/* Price Preview */}
          {buyPreview && (
            <div className="mt-4">
              <PricePreview
                amount={amount}
                cost={buyPreview.cost}
                shares={buyPreview.shares}
                newProbability={
                  outcome === 'YES'
                    ? buyPreview.newProbability
                    : 1 - buyPreview.newProbability
                }
                outcome={outcome}
                currentProbability={
                  outcome === 'YES' ? currentProbabilityYes : currentProbabilityNo
                }
              />
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={!buyPreview || amount <= 0 || isLoading || buyPreview.cost > userBalance}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading
              ? 'Processing...'
              : buyPreview && buyPreview.cost > userBalance
              ? 'Insufficient Balance'
              : `Buy ${outcome} Shares`}
          </button>
        </>
      ) : (
        <div className="text-center text-slate-400 py-8">
          {hasPosition ? (
            <p>Click "Sell" on any position above to sell your shares</p>
          ) : (
            <p>You don't have any positions in this market yet</p>
          )}
        </div>
      )}
    </div>
  );
}

