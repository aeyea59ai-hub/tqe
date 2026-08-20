import React from 'react';
import { Menu, RefreshCw, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { AccountState, QualityReport } from '../../types';

interface GlobalHeaderProps {
  title: string;
  description: string;
  qualityReport: QualityReport;
  accountState: AccountState;
  contextSymbol?: string;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  onOpenMarketPicker?: () => void;
}

function freshnessLabel(ms: number) {
  if (!Number.isFinite(ms)) return 'Unknown';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  description,
  qualityReport,
  accountState,
  contextSymbol,
  onOpenMobileMenu,
  onOpenSearch,
  onRefresh,
  onOpenMarketPicker,
}) => {
  const healthy = qualityReport.status === 'HEALTHY';
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#080c14]/95 backdrop-blur-xl">
      <div className="flex min-h-[64px] items-center gap-3 px-3 sm:px-5 lg:px-6">
        <button onClick={onOpenMobileMenu} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 md:hidden" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="truncate text-sm font-extrabold tracking-tight text-slate-50 sm:text-base">{title}</h1>
            {contextSymbol && onOpenMarketPicker && (
              <button
                onClick={onOpenMarketPicker}
                className="hidden items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/15 sm:flex"
              >
                <Sparkles className="h-3 w-3" />
                {contextSymbol}
              </button>
            )}
          </div>
          <p className="mt-0.5 hidden truncate text-[11px] text-slate-500 sm:block">{description}</p>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 font-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-slate-500">DATA</span>
            <span className="font-bold text-slate-200">MARKET RUNTIME</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[10px] ${
            healthy
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}>
            <ShieldCheck className="h-3 w-3" />
            <span>{qualityReport.status}</span>
            <span className="opacity-60">·</span>
            <span>{freshnessLabel(qualityReport.freshnessMs)}</span>
          </div>
          {accountState.dailyLockout && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 font-mono text-[10px] font-bold text-rose-300">RISK LOCK</div>
          )}
        </div>

        <button onClick={onOpenSearch} className="hidden h-9 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:text-slate-100 sm:flex">
          <Search className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden xl:inline">Search markets & commands</span>
          <kbd className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">⌘K</kbd>
        </button>

        <button onClick={onRefresh} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-100" aria-label="Refresh current data">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
