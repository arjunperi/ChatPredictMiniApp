'use client';

import { useQuery } from '@tanstack/react-query';
import { useMarkets } from '@/hooks/use-markets';
import { MarketCard } from '@/components/market-card';
import { SkeletonList } from '@/components/ui/skeleton';
import Link from 'next/link';

export function RecentActivity() {
  const { data: markets, isLoading } = useMarkets(undefined, 'ACTIVE');

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Markets</h2>
        <SkeletonList count={3} />
      </div>
    );
  }

  const recentMarkets = markets?.slice(0, 3) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recent Markets</h2>
        <Link
          href="/markets"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          View all →
        </Link>
      </div>
      {recentMarkets.length > 0 ? (
        <div className="space-y-3">
          {recentMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          <p className="text-slate-400">No active markets yet</p>
          <Link
            href="/markets"
            className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            Create one →
          </Link>
        </div>
      )}
    </div>
  );
}

