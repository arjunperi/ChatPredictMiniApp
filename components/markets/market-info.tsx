import { Market } from '@/types/market';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface MarketInfoProps {
  market: Market;
}

export function MarketInfo({ market }: MarketInfoProps) {
  const probabilityYes = market.probabilityYes || 0.5;
  const probabilityYesPercent = Math.round(probabilityYes * 100);
  const probabilityNoPercent = 100 - probabilityYesPercent;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
      {/* Question */}
      <h1 className="text-2xl font-bold text-white mb-4">{market.question}</h1>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4">
        {market.status === 'ACTIVE' && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Live
          </Badge>
        )}
        {market.status === 'RESOLVED' && (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Resolved: {market.resolution}
          </Badge>
        )}
        {market.status === 'CLOSED' && (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            Closed
          </Badge>
        )}
      </div>

      {/* Probability Bars */}
      <div className="space-y-4 mb-6">
        {/* YES */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-medium">YES</span>
            <span className="text-white font-bold text-lg">
              {probabilityYesPercent}%
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
              style={{ width: `${probabilityYesPercent}%` }}
            />
          </div>
        </div>

        {/* NO */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-medium">NO</span>
            <span className="text-white font-bold text-lg">
              {probabilityNoPercent}%
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-500"
              style={{ width: `${probabilityNoPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
        <div>
          <div className="text-xs text-slate-400 mb-1">Creator</div>
          <div className="text-white font-medium">
            @{market.creator?.username || market.creator?.firstName || 'Unknown'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Total Bets</div>
          <div className="text-white font-medium">
            {market._count?.bets || 0}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Created</div>
          <div className="text-white font-medium text-sm">
            {formatDistanceToNow(new Date(market.createdAt), { addSuffix: true })}
          </div>
        </div>
        {market.closesAt && (
          <div>
            <div className="text-xs text-slate-400 mb-1">Closes</div>
            <div className="text-white font-medium text-sm">
              {formatDistanceToNow(new Date(market.closesAt), { addSuffix: true })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

