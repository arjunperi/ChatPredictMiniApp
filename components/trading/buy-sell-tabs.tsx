'use client';

import { useState } from 'react';

interface BuySellTabsProps {
  activeTab: 'buy' | 'sell';
  onTabChange: (tab: 'buy' | 'sell') => void;
  hasPosition: boolean;
}

export function BuySellTabs({
  activeTab,
  onTabChange,
  hasPosition,
}: BuySellTabsProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('buy')}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
          activeTab === 'buy'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
        }`}
      >
        Buy
      </button>
      <button
        onClick={() => onTabChange('sell')}
        disabled={!hasPosition}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
          !hasPosition
            ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
            : activeTab === 'sell'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
        }`}
      >
        Sell
      </button>
    </div>
  );
}

