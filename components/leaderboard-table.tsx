'use client';

import { LeaderboardEntry } from '@/types/api';

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
}

const getMedalEmoji = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
};

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🏆</span>
          <span>Top Traders</span>
        </h2>
      </div>
      <div className="divide-y divide-slate-700">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between p-4 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-white font-bold">
                {getMedalEmoji(entry.rank) || entry.rank}
              </div>
              <div>
                <div className="font-medium text-white">
                  @{entry.username}
                </div>
                <div className="text-xs text-slate-400">
                  {entry.totalBets} {entry.totalBets === 1 ? 'bet' : 'bets'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white text-lg">
                {entry.tokenBalance.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                tokens
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

