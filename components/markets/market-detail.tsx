'use client';

import { Market } from '@/types/market';
import { MarketInfo } from './market-info';
import { Loading } from '@/components/ui/loading';

interface MarketDetailProps {
  market: Market;
  isLoading?: boolean;
}

export function MarketDetail({ market, isLoading }: MarketDetailProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (!market) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p className="text-slate-400">Market not found</p>
      </div>
    );
  }

  return (
    <div>
      <MarketInfo market={market} />
      {/* Trading panel and bet history will be added here */}
    </div>
  );
}

