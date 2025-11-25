'use client';

import { MarketStatus } from '@/types/market';

interface FiltersProps {
  status: string;
  sort: string;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
}

export function Filters({ status, sort, onStatusChange, onSortChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Status Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Sort Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="closing">Closing Soon</option>
        </select>
      </div>
    </div>
  );
}

