'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Loading } from '@/components/ui/loading';
import { useTelegramContext } from '@/lib/telegram/context';

// TODO: Replace with actual API call once user context is available
function getUserStats() {
  return Promise.resolve({
    balance: 1000,
    activePositions: 5,
    totalInvested: 5000,
    totalReturns: 5200,
    netPL: 200,
  });
}

function getMarketStats(chatId?: string | null) {
  const params = new URLSearchParams();
  if (chatId) params.append('chatId', chatId);
  
  return fetch(`/api/markets?${params}`)
    .then((res) => res.json())
    .then((data) => ({
      totalMarkets: data.markets?.length || 0,
      activeMarkets: data.markets?.filter((m: any) => m.status === 'ACTIVE').length || 0,
    }));
}

export default function Home() {
  const { chatId } = useTelegramContext();
  
  const { data: userStats, isLoading: userLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: getUserStats,
  });

  const { data: marketStats, isLoading: marketLoading } = useQuery({
    queryKey: ['market-stats', chatId],
    queryFn: () => getMarketStats(chatId),
  });

  if (userLoading || marketLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to ChatPredict
        </h1>
        <p className="text-slate-400">
          Create and trade prediction markets in Telegram groups
        </p>
        {chatId && (
          <div className="mt-2 inline-block bg-blue-600/20 border border-blue-600/50 rounded-lg px-3 py-1 text-sm text-blue-300">
            📍 Group Mode: Markets scoped to this group
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Token Balance"
          value={userStats?.balance?.toLocaleString() || '0'}
          icon="🪙"
          subtitle="Available tokens"
        />
        <StatsCard
          title="Active Positions"
          value={userStats?.activePositions || 0}
          icon="📊"
          subtitle="Markets you're in"
        />
        <StatsCard
          title="Net P&L"
          value={`${userStats?.netPL && userStats.netPL >= 0 ? '+' : ''}${userStats?.netPL?.toLocaleString() || '0'}`}
          icon="💰"
          subtitle="Total profit/loss"
          trend={
            userStats?.netPL
              ? {
                  value: (userStats.netPL / (userStats.totalInvested || 1)) * 100,
                  isPositive: userStats.netPL >= 0,
                }
              : undefined
          }
        />
        <StatsCard
          title="Active Markets"
          value={marketStats?.activeMarkets || 0}
          icon="📈"
          subtitle={`${marketStats?.totalMarkets || 0} total markets`}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/markets?create=true"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            <span>Create Market</span>
          </Link>
          <Link
            href="/markets"
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-slate-700 flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Browse Markets</span>
          </Link>
          <Link
            href="/portfolio"
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-slate-700 flex items-center gap-2"
          >
            <span>💼</span>
            <span>View Portfolio</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
