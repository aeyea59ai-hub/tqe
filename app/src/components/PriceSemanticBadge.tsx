// Price Semantic Badge - Mandated by Section 24 of Blueprint
import React from 'react';

export type PriceSemanticType =
  | 'LIVE_LAST'
  | 'MARK_PRICE'
  | 'INDEX_PRICE'
  | 'BEST_BID'
  | 'BEST_ASK'
  | 'CANDLE_CLOSE'
  | 'ANALYSIS_SNAPSHOT'
  | 'DECISION_ENTRY'
  | 'PAPER_FILL';

interface PriceSemanticBadgeProps {
  type: PriceSemanticType;
  price: number;
  timestamp?: number;
  source?: string;
  isStale?: boolean;
  precision?: number;
  className?: string;
}

const LABELS: Record<PriceSemanticType, { title: string; color: string; bg: string }> = {
  LIVE_LAST: { title: 'LIVE LAST', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60' },
  MARK_PRICE: { title: 'MARK PRICE', color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/60' },
  INDEX_PRICE: { title: 'INDEX PRICE', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800/60' },
  BEST_BID: { title: 'BEST BID', color: 'text-emerald-300', bg: 'bg-emerald-950/40 border-emerald-800/40' },
  BEST_ASK: { title: 'BEST ASK', color: 'text-rose-300', bg: 'bg-rose-950/40 border-rose-800/40' },
  CANDLE_CLOSE: { title: 'CANDLE CLOSE', color: 'text-slate-300', bg: 'bg-slate-900 border-slate-800' },
  ANALYSIS_SNAPSHOT: { title: 'ANALYSIS SNAPSHOT', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60' },
  DECISION_ENTRY: { title: 'DECISION ENTRY', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800/60' },
  PAPER_FILL: { title: 'PAPER FILL', color: 'text-fuchsia-400', bg: 'bg-fuchsia-950/60 border-fuchsia-800/60' },
};

export const PriceSemanticBadge: React.FC<PriceSemanticBadgeProps> = ({
  type,
  price,
  timestamp,
  source = 'BINANCE_FUTURES',
  isStale = false,
  precision = 2,
  className = '',
}) => {
  const meta = LABELS[type] || LABELS.LIVE_LAST;
  const formattedPrice = typeof price === 'number' ? price.toFixed(precision) : '0.00';

  return (
    <div className={`inline-flex flex-col p-2 rounded-lg border ${meta.bg} ${className} font-mono`}>
      <div className="flex items-center justify-between space-x-2">
        <span className={`text-3xs font-extrabold uppercase tracking-wider ${meta.color}`}>
          {meta.title}
        </span>
        {isStale && (
          <span className="text-3xs font-bold px-1 py-0.2 bg-rose-950 text-rose-400 border border-rose-800 rounded">
            STALE
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-1 mt-0.5">
        <span className="text-xs text-slate-400">$</span>
        <span className={`text-base font-black tracking-tight ${meta.color}`}>
          {formattedPrice}
        </span>
      </div>

      <div className="flex items-center justify-between text-3xs text-slate-500 mt-0.5 space-x-2">
        <span>{source}</span>
        {timestamp && <span>{new Date(timestamp).toLocaleTimeString()}</span>}
      </div>
    </div>
  );
};
