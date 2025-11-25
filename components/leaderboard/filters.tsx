'use client';

interface LeaderboardFiltersProps {
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export function LeaderboardFilters({
  timeframe,
  onTimeframeChange,
}: LeaderboardFiltersProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-400 mb-2">
        Timeframe
      </label>
      <select
        value={timeframe}
        onChange={(e) => onTimeframeChange(e.target.value)}
        className="w-full md:w-auto bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Time</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </div>
  );
}

