'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMarkets } from '@/hooks/use-markets';
import { MarketCard } from '@/components/market-card';
import { Filters } from '@/components/markets/filters';
import { Search } from '@/components/markets/search';
import { CreateMarketModal } from '@/components/markets/create-market-modal';
import { Loading, LoadingPage } from '@/components/ui/loading';
import { SkeletonList } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Market } from '@/types/market';

function filterAndSortMarkets(
  markets: Market[],
  searchQuery: string,
  status: string,
  sort: string
): Market[] {
  let filtered = [...markets];

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((market) =>
      market.question.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter((market) => market.status === status);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sort) {
      case 'popular':
        return (b._count?.bets || 0) - (a._count?.bets || 0);
      case 'closing':
        if (!a.closesAt && !b.closesAt) return 0;
        if (!a.closesAt) return 1;
        if (!b.closesAt) return -1;
        return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return filtered;
}

export default function MarketsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createParam = searchParams.get('create');

  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: markets, isLoading, error } = useMarkets();

  // Show create modal if create param is present
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'true') {
      setShowCreateModal(true);
      // Remove param from URL
      const params = new URLSearchParams(searchParams);
      params.delete('create');
      router.replace(`/markets?${params}`);
    }
  }, [searchParams, router]);

  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    return filterAndSortMarkets(markets, searchQuery, status, sort);
  }, [markets, searchQuery, status, sort]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkeletonList count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 text-red-400">
          Error loading markets. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Markets</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Create Market</span>
        </button>
      </div>

      <CreateMarketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Search */}
      <Search value={searchQuery} onChange={setSearchQuery} />

      {/* Filters */}
      <Filters
        status={status}
        sort={sort}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          const params = new URLSearchParams(searchParams);
          if (newStatus) {
            params.set('status', newStatus);
          } else {
            params.delete('status');
          }
          router.push(`/markets?${params}`);
        }}
        onSortChange={(newSort) => {
          setSort(newSort);
          const params = new URLSearchParams(searchParams);
          params.set('sort', newSort);
          router.push(`/markets?${params}`);
        }}
      />

      {/* Markets List */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <p className="text-slate-400 text-lg mb-4">No markets found</p>
          {searchQuery || status ? (
            <p className="text-slate-500 text-sm mb-4">
              Try adjusting your filters
            </p>
          ) : (
            <Link
              href="/markets?create=true"
              className="text-blue-400 hover:text-blue-300 inline-block"
            >
              Create the first market →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

