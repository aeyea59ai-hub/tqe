import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  Database,
  Radar,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { AccountState, CanonicalSnapshot, ScanCandidate, SymbolInfo } from '../types';
import { useMarketStore } from '../lib/marketStore';

interface DashboardHomeProps {
  snapshot: CanonicalSnapshot;
  candidates: ScanCandidate[];
  accountState: AccountState;
  symbols: SymbolInfo[];
  onSelectSymbol: (symbol: string) => void;
  onNavigateTab: (tab: string) => void;
  onRunScanner: () => void;
}

function formatPrice(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value < 10 ? 4 : 2,
    maximumFractionDigits: value < 10 ? 4 : 2,
  });
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  snapshot,
  candidates = [],
  accountState,
  symbols = [],
  onSelectSymbol,
  onNavigateTab,
  onRunScanner,
}) => {
  const marketStore = useMarketStore();
  const marketBySymbol = React.useMemo(() => new Map(marketStore.map((item) => [item.symbol, item])), [marketStore]);
  const longCount = candidates.filter((candidate) => candidate.direction === 'LONG').length;
  const shortCount = candidates.filter((candidate) => candidate.direction === 'SHORT').length;
  const topCandidates = React.useMemo(() => {
    const bestBySymbolSide = new Map<string, ScanCandidate>();
    for (const candidate of candidates) {
      const key = `${candidate.symbol}:${candidate.direction}`;
      const current = bestBySymbolSide.get(key);
      if (!current || candidate.qualityScore > current.qualityScore) {
        bestBySymbolSide.set(key, candidate);
      }
    }
    return [...bestBySymbolSide.values()]
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 6);
  }, [candidates]);

  const metricCards = [
    { label: 'Market regime', value: snapshot.regime.replaceAll('_', ' '), detail: `${snapshot.timeframe} snapshot`, icon: Activity, tone: 'text-cyan-300' },
    { label: 'Data quality', value: snapshot.qualityReport.status, detail: `Fresh ${snapshot.qualityReport.freshnessMs} ms`, icon: ShieldCheck, tone: snapshot.qualityReport.status === 'HEALTHY' ? 'text-emerald-300' : 'text-amber-300' },
    { label: 'Scanner candidates', value: String(candidates.length), detail: `${longCount} long · ${shortCount} short`, icon: Radar, tone: 'text-cyan-300' },
    { label: 'Paper equity', value: `$${accountState.equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, detail: `${accountState.positions.length} open position${accountState.positions.length === 1 ? '' : 's'}`, icon: WalletCards, tone: accountState.totalPnlUsd >= 0 ? 'text-emerald-300' : 'text-rose-300' },
  ];

  return (
    <div className="space-y-4 font-mono text-xs text-slate-100">
      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-lg border border-slate-800 bg-[#0b101a] p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-600">{metric.label}</div>
                  <div className={`mt-2 truncate text-sm font-black sm:text-base ${metric.tone}`}>{metric.value}</div>
                  <div className="mt-1 truncate text-[10px] text-slate-500">{metric.detail}</div>
                </div>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-800 bg-slate-950 text-slate-500"><Icon className="h-4 w-4" /></div>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-lg border border-slate-800 bg-[#0b101a]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.13em] text-slate-200">Top opportunities</h2>
              <p className="mt-0.5 text-[10px] text-slate-500">Highest-ranked scanner results. Open a workspace for full context.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onRunScanner} className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300">Run scan</button>
              <button onClick={() => onNavigateTab('scanner')} className="flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/15">View scanner <ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>

          {topCandidates.length === 0 ? (
            <div className="grid min-h-64 place-items-center p-8 text-center">
              <div><Radar className="mx-auto h-6 w-6 text-slate-700" /><div className="mt-3 font-semibold text-slate-400">No scanner results yet</div><div className="mt-1 text-[10px] text-slate-600">Run a scan to populate the market-wide opportunity list.</div></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead><tr className="border-b border-slate-800 bg-slate-950/40 text-[9px] uppercase tracking-[0.12em] text-slate-600"><th className="px-4 py-2.5">Symbol</th><th className="px-3 py-2.5">Side</th><th className="px-3 py-2.5">Strategy</th><th className="px-3 py-2.5">Regime</th><th className="px-3 py-2.5">Score</th><th className="px-3 py-2.5">Price</th><th className="px-4 py-2.5 text-right">Action</th></tr></thead>
                <tbody>
                  {topCandidates.map((candidate) => {
                    const live = marketBySymbol.get(candidate.symbol);
                    const price = live?.lastPrice || candidate.price;
                    const researchOnly = candidate.symbol !== 'BTCUSDT' && candidate.symbol !== 'ETHUSDT';
                    return (
                      <tr key={candidate.id} className="border-b border-slate-800/70 last:border-b-0 hover:bg-slate-900/50">
                        <td className="px-4 py-3"><button onClick={() => { onSelectSymbol(candidate.symbol); onNavigateTab('workspace'); }} className="font-black text-slate-100 hover:text-cyan-300">{candidate.symbol}</button></td>
                        <td className="px-3 py-3"><span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-black ${candidate.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30'}`}>{candidate.direction}</span></td>
                        <td className="max-w-[220px] px-3 py-3"><div className="truncate font-semibold text-slate-300">{candidate.strategyCode} · {candidate.strategyName}</div>{researchOnly && <div className="mt-0.5 text-[9px] font-bold text-amber-400">RESEARCH ONLY</div>}</td>
                        <td className="px-3 py-3 text-[10px] text-slate-500">{candidate.marketRegime.replaceAll('_', ' ')}</td>
                        <td className="px-3 py-3 font-black text-cyan-300">{candidate.qualityScore}</td>
                        <td className="px-3 py-3 font-semibold text-slate-300">${formatPrice(price)}</td>
                        <td className="px-4 py-3 text-right"><button onClick={() => { onSelectSymbol(candidate.symbol); onNavigateTab('workspace'); }} className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300">Open workspace</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-800 bg-[#0b101a] p-4">
            <div className="flex items-center justify-between"><h2 className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">System status</h2><Database className="h-4 w-4 text-cyan-400" /></div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"><span className="text-slate-500">Market data quality</span><span className={`flex items-center gap-1 text-[10px] font-bold ${snapshot.qualityReport.status === 'HEALTHY' ? 'text-emerald-300' : 'text-amber-300'}`}><CheckCircle2 className="h-3 w-3" /> {snapshot.qualityReport.status}</span></div>
              <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"><span className="text-slate-500">Snapshot</span><span className="font-semibold text-slate-300">{snapshot.symbol} · {snapshot.timeframe}</span></div>
              <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"><span className="text-slate-500">Scanner universe</span><span className="font-semibold text-slate-300">{symbols.length || '—'} markets</span></div>
            </div>
            <button onClick={() => onNavigateTab('settings')} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-700 px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-100">Provider settings <ArrowRight className="h-3 w-3" /></button>
          </section>

          <section className="rounded-lg border border-slate-800 bg-[#0b101a] p-4">
            <div className="flex items-center justify-between"><h2 className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Paper overview</h2><WalletCards className="h-4 w-4 text-cyan-400" /></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3"><div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Total P&L</div><div className={`mt-1 font-black ${accountState.totalPnlUsd >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{accountState.totalPnlUsd >= 0 ? '+' : ''}${accountState.totalPnlUsd.toFixed(2)}</div></div>
              <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3"><div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Open</div><div className="mt-1 font-black text-slate-200">{accountState.positions.length}</div></div>
            </div>
            <button onClick={() => onNavigateTab('paper-trading')} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/15">Open paper section <ArrowRight className="h-3 w-3" /></button>
          </section>

          <section className="rounded-lg border border-slate-800 bg-[#0b101a] p-4">
            <div className="flex items-center justify-between"><h2 className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Attention</h2><BellRing className="h-4 w-4 text-amber-400" /></div>
            <div className="mt-3 space-y-2">
              {accountState.dailyLockout ? (
                <div className="flex gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><div className="font-bold">Daily risk lock active</div><div className="mt-0.5 text-[10px] text-rose-300/70">New paper approvals are restricted.</div></div></div>
              ) : (
                <div className="flex gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><div><div className="font-bold">No active risk lock</div><div className="mt-0.5 text-[10px] text-emerald-300/60">Paper account remains within current limits.</div></div></div>
              )}
              <button onClick={() => onNavigateTab('opportunities')} className="flex w-full items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-left text-slate-400 hover:text-slate-100"><span className="flex items-center gap-2"><BrainCircuit className="h-3.5 w-3.5 text-purple-400" /> Review AI evidence</span><ArrowRight className="h-3 w-3" /></button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
