'use client';

import { Market } from '@/types/market';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { LMSR } from '@/lib/lmsr';

interface MarketCardProps {
  market: Market;
  showActions?: boolean;
}

export function MarketCard({ market, showActions = false }: MarketCardProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/49efe74e-58fa-4301-bd61-e7414a2ae428',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/market-card.tsx:12',message:'MarketCard rendering',data:{marketId:market.id,hasProbabilityYes:market.probabilityYes!==undefined,probabilityYes:market.probabilityYes,sharesYes:market.sharesYes,sharesNo:market.sharesNo,liquidity:market.liquidity},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Calculate probability if not provided by API (fallback)
  let probability: number;
  if (market.probabilityYes !== undefined) {
    probability = market.probabilityYes;
  } else {
    // Calculate client-side as fallback
    const lmsr = new LMSR(market.liquidity);
    probability = lmsr.getProbability(market.sharesYes, market.sharesNo);
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/49efe74e-58fa-4301-bd61-e7414a2ae428',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/market-card.tsx:20',message:'MarketCard probability calculation',data:{probabilityYesFromMarket:market.probabilityYes,calculatedProbability:probability,calculatedClientSide:market.probabilityYes===undefined,sharesYes:market.sharesYes,sharesNo:market.sharesNo},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const probabilityYes = Math.round(probability * 100);
  const probabilityNo = 100 - probabilityYes;

  const formatVolume = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="group relative bg-slate-800 hover:bg-slate-750 rounded-lg p-4 transition-all duration-200 cursor-pointer border border-slate-700 hover:border-slate-600">
        {/* Market Question */}
        <h3 className="text-base font-medium text-white mb-4 group-hover:text-blue-400 transition-colors">
          {market.question}
        </h3>

        {/* YES Option */}
        <div className="mb-3">
          <div className="flex items-center gap-3 mb-1.5">
            <div 
              className="flex-shrink-0 px-3 py-1.5 rounded text-sm font-bold text-white"
              style={{ 
                backgroundColor: `rgba(34, 197, 94, ${0.2 + (probabilityYes / 100) * 0.6})`,
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {probabilityYes}%
            </div>
            <span className="text-slate-200 text-sm font-medium">YES</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
              style={{ width: `${probabilityYes}%` }}
            />
          </div>
        </div>

        {/* NO Option */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1.5">
            <div 
              className="flex-shrink-0 px-3 py-1.5 rounded text-sm font-bold text-white"
              style={{ 
                backgroundColor: `rgba(239, 68, 68, ${0.2 + (probabilityNo / 100) * 0.6})`,
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {probabilityNo}%
            </div>
            <span className="text-slate-200 text-sm font-medium">NO</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-500"
              style={{ width: `${probabilityNo}%` }}
            />
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-4">
            <span>👤 {market.creator?.username || market.creator?.firstName || 'Unknown'}</span>
            <span>📊 {formatVolume(market._count?.bets || 0)} bets</span>
          </div>
          <div className="flex items-center gap-2">
            {market.status === 'ACTIVE' && (
              <Badge className="bg-green-500/20 text-green-400 text-xs border-green-500/30">
                Live
              </Badge>
            )}
            {market.status === 'RESOLVED' && (
              <Badge className="bg-blue-500/20 text-blue-400 text-xs border-blue-500/30">
                Resolved
              </Badge>
            )}
            {market.closesAt && market.status === 'ACTIVE' && (
              <span className="text-orange-400">
                ⏰ {new Date(market.closesAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

