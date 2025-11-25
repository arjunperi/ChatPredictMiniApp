'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { LeaderboardTable } from '@/components/leaderboard-table';
import { LeaderboardFilters } from '@/components/leaderboard/filters';
import { LoadingPage } from '@/components/ui/loading';
import { SkeletonList } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('all');
  const { data: leaderboard, isLoading, error } = useLeaderboard(timeframe);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkeletonList count={10} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-6 text-red-400">
          Error loading leaderboard. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <LeaderboardFilters
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </div>

      {leaderboard && leaderboard.length > 0 ? (
        <LeaderboardTable leaderboard={leaderboard} />
      ) : (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <p className="text-slate-400">No leaderboard data available</p>
        </div>
      )}
    </div>
  );
}

