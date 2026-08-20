import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Filter,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { ScanCandidate } from '../types';

interface MultiStageScannerProps {
  candidates: ScanCandidate[];
  onSelectCandidate: (candidate: ScanCandidate) => void;
  onRunScan: () => void;
  isLoading: boolean;
  onBatchAIScan?: (candidates: ScanCandidate[]) => void;
}

type SideFilter = 'ALL' | 'LONG' | 'SHORT';
type EligibilityFilter = 'ALL' | 'PUBLISHABLE' | 'RESEARCH';

const stageLabels: Array<[keyof ScanCandidate['stageResults'], string]> = [
  ['eligibility', 'Eligibility'],
  ['liquidity', 'Liquidity'],
  ['dataQuality', 'Data quality'],
  ['volatility', 'Volatility'],
  ['marketRegime', 'Regime'],
  ['strategyCompatibility', 'Strategy'],
  ['derivativesAlignment', 'Derivatives'],
  ['preliminaryRisk', 'Preliminary risk'],
];

const isResearchOnly = (candidate: ScanCandidate) => candidate.symbol !== 'BTCUSDT' && candidate.symbol !== 'ETHUSDT';

function formatPrice(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value < 10 ? 4 : 2,
    maximumFractionDigits: value < 10 ? 4 : 2,
  });
}

export const MultiStageScanner: React.FC<MultiStageScannerProps> = ({
  candidates,
  onSelectCandidate,
  onRunScan,
  isLoading,
  onBatchAIScan,
}) => {
  const [query, setQuery] = React.useState('');
  const [side, setSide] = React.useState<SideFilter>('ALL');
  const [eligibility, setEligibility] = React.useState<EligibilityFilter>('ALL');
  const [minScore, setMinScore] = React.useState(0);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const [inspectedId, setInspectedId] = React.useState<string | null>(null);

  const groups = React.useMemo(() => {
    const map = new Map<string, ScanCandidate[]>();
    for (const candidate of candidates) {
      if (query && !candidate.symbol.toLowerCase().includes(query.toLowerCase())) continue;
      if (side !== 'ALL' && candidate.direction !== side) continue;
      if (candidate.qualityScore < minScore) continue;
      const research = isResearchOnly(candidate);
      if (eligibility === 'PUBLISHABLE' && research) continue;
      if (eligibility === 'RESEARCH' && !research) continue;
      const key = `${candidate.symbol}:${candidate.direction}`;
      map.set(key, [...(map.get(key) || []), candidate]);
    }
    return [...map.entries()]
      .map(([key, entries]) => ({ key, entries: [...entries].sort((a, b) => b.qualityScore - a.qualityScore) }))
      .sort((a, b) => b.entries[0].qualityScore - a.entries[0].qualityScore);
  }, [candidates, eligibility, minScore, query, side]);

  const primaryCandidates = React.useMemo(() => groups.map((group) => group.entries[0]), [groups]);

  React.useEffect(() => {
    if (inspectedId && candidates.some((candidate) => candidate.id === inspectedId)) return;
    setInspectedId(primaryCandidates[0]?.id || null);
  }, [candidates, inspectedId, primaryCandidates]);

  const inspected = candidates.find((candidate) => candidate.id === inspectedId) || primaryCandidates[0];
  const publishableCount = primaryCandidates.filter((candidate) => !isResearchOnly(candidate)).length;
  const researchCount = primaryCandidates.length - publishableCount;
  const longCount = primaryCandidates.filter((candidate) => candidate.direction === 'LONG').length;
  const shortCount = primaryCandidates.filter((candidate) => candidate.direction === 'SHORT').length;

  const toggleSelected = (candidate: ScanCandidate) => {
    if (isResearchOnly(candidate)) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(candidate.id)) next.delete(candidate.id);
      else next.add(candidate.id);
      return next;
    });
  };

  const toggleExpanded = (key: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runBatch = () => {
    if (!onBatchAIScan) return;
    const selected = candidates.filter((candidate) => selectedIds.has(candidate.id));
    onBatchAIScan(selected.length > 0 ? selected : primaryCandidates);
  };

  const clearFilters = () => {
    setQuery('');
    setSide('ALL');
    setEligibility('ALL');
    setMinScore(0);
  };

  const renderRow = (candidate: ScanCandidate, nested = false) => {
    const long = candidate.direction === 'LONG';
    const research = isResearchOnly(candidate);
    const active = inspected?.id === candidate.id;
    const selected = selectedIds.has(candidate.id);
    return (
      <div
        key={candidate.id}
        role="button"
        tabIndex={0}
        onClick={() => setInspectedId(candidate.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') setInspectedId(candidate.id);
        }}
        className={`group grid cursor-pointer grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-800/70 px-3 py-3 last:border-b-0 sm:grid-cols-[28px_minmax(200px,1.2fr)_minmax(170px,1fr)_90px_auto] ${
          nested ? 'bg-slate-950/35 pl-8' : ''
        } ${active ? 'bg-cyan-500/[0.07]' : 'hover:bg-slate-900/60'}`}
      >
        <button
          onClick={(event) => { event.stopPropagation(); toggleSelected(candidate); }}
          disabled={research}
          className={`grid h-5 w-5 place-items-center rounded border ${
            selected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-950 text-transparent hover:border-slate-500'
          } disabled:cursor-not-allowed disabled:opacity-25`}
          aria-label={selected ? `Deselect ${candidate.symbol}` : `Select ${candidate.symbol}`}
        >
          <Check className="h-3 w-3" />
        </button>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border ${long ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
              {long ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-black text-slate-100">{candidate.symbol}</span>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-black ${long ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>{candidate.direction}</span>
                {research && <span className="hidden rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-300 md:inline">RESEARCH ONLY</span>}
              </div>
              <div className="mt-0.5 flex gap-2 text-[9px] text-slate-600 sm:hidden"><span>{candidate.strategyCode}</span><span>·</span><span>{candidate.qualityScore}/100</span></div>
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 sm:block">
          <div className="truncate text-[10px] font-semibold text-slate-300">{candidate.strategyCode} · {candidate.strategyName}</div>
          <div className="mt-0.5 truncate text-[9px] text-slate-600">{candidate.marketRegime.replaceAll('_', ' ')} · {candidate.tf}</div>
        </div>

        <div className="hidden text-right sm:block"><div className="font-black text-cyan-300">{candidate.qualityScore}</div><div className="text-[9px] text-slate-600">quality</div></div>
        <div className="flex items-center gap-2">
          <div className="hidden text-right lg:block"><div className="font-semibold text-slate-300">${formatPrice(candidate.price)}</div><div className="text-[9px] text-slate-600">snapshot</div></div>
          <ChevronRight className={`h-4 w-4 ${active ? 'text-cyan-300' : 'text-slate-700 group-hover:text-slate-400'}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 font-mono text-xs text-slate-100">
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['Ranked setups', primaryCandidates.length, Radar, 'text-cyan-300'],
          ['Long / Short', `${longCount} / ${shortCount}`, ArrowUpRight, 'text-slate-200'],
          ['Publishable', publishableCount, ShieldCheck, 'text-emerald-300'],
          ['Research only', researchCount, AlertTriangle, 'text-amber-300'],
        ].map(([label, value, Icon, tone]) => (
          <div key={String(label)} className="rounded-lg border border-slate-800 bg-[#0b101a] p-3">
            <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">{String(label)}</span>{React.createElement(Icon as React.ElementType, { className: `h-3.5 w-3.5 ${tone}` })}</div>
            <div className={`mt-2 text-base font-black ${tone}`}>{String(value)}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)_340px]">
        <aside className="rounded-lg border border-slate-800 bg-[#0b101a] p-3 xl:sticky xl:top-[80px] xl:h-[calc(100vh-96px)] xl:overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-cyan-400" /><span className="font-black uppercase tracking-[0.12em] text-slate-300">Scan controls</span></div>
            <button onClick={clearFilters} className="text-[9px] font-bold text-slate-600 hover:text-slate-300">Reset</button>
          </div>

          <button onClick={onRunScan} disabled={isLoading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 font-bold text-cyan-300 hover:bg-cyan-500/15 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />{isLoading ? 'Scanning…' : 'Run full scan'}
          </button>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Search symbol</span>
              <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2">
                <Search className="h-3.5 w-3.5 text-slate-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="BTC, ETH, SOL…" className="min-w-0 flex-1 bg-transparent text-[11px] text-slate-200 outline-none placeholder:text-slate-700" />
              </div>
            </label>

            <div>
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Direction</span>
              <div className="grid grid-cols-3 gap-1">
                {(['ALL', 'LONG', 'SHORT'] as SideFilter[]).map((option) => (
                  <button key={option} onClick={() => setSide(option)} className={`rounded-md border px-2 py-1.5 text-[9px] font-black ${side === option ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-slate-800 bg-slate-950 text-slate-600 hover:text-slate-300'}`}>{option}</button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Eligibility</span>
              <div className="space-y-1">
                {([['ALL', 'All setups'], ['PUBLISHABLE', 'BTC / ETH'], ['RESEARCH', 'Research only']] as Array<[EligibilityFilter, string]>).map(([value, label]) => (
                  <button key={value} onClick={() => setEligibility(value)} className={`flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left text-[10px] ${eligibility === value ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200' : 'border-slate-800 bg-slate-950/60 text-slate-500 hover:text-slate-200'}`}>
                    <span>{label}</span>{eligibility === value && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600"><span>Minimum score</span><span className="text-slate-400">{minScore}</span></div>
              <input type="range" min="0" max="90" step="5" value={minScore} onChange={(event) => setMinScore(Number(event.target.value))} className="w-full accent-cyan-400" />
            </label>
          </div>

          <div className="mt-5 border-t border-slate-800 pt-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Batch review</div>
            <div className="mt-2 text-[10px] text-slate-500">{selectedIds.size} publishable setup{selectedIds.size === 1 ? '' : 's'} selected.</div>
            <button onClick={runBatch} disabled={!onBatchAIScan || primaryCandidates.length === 0} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-[10px] font-bold text-purple-300 hover:bg-purple-500/15 disabled:opacity-40"><Cpu className="h-3.5 w-3.5" /> Review selected</button>
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0b101a]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-3 py-3 sm:px-4">
            <div><h2 className="font-black uppercase tracking-[0.12em] text-slate-300">Ranked candidates</h2><p className="mt-0.5 text-[9px] text-slate-600">One primary result per symbol and side. Alternative matches remain grouped.</p></div>
            <span className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[9px] font-bold text-slate-500">{primaryCandidates.length} rows</span>
          </div>

          {groups.length === 0 ? (
            <div className="grid min-h-[420px] place-items-center p-8 text-center"><div><Radar className="mx-auto h-7 w-7 text-slate-700" /><div className="mt-3 font-semibold text-slate-400">No matching candidates</div><div className="mt-1 text-[10px] text-slate-600">Run a scan or adjust filters.</div></div></div>
          ) : (
            <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
              {groups.map((group) => {
                const primary = group.entries[0];
                const alternatives = group.entries.slice(1);
                const expanded = expandedGroups.has(group.key);
                return (
                  <React.Fragment key={group.key}>
                    {renderRow(primary)}
                    {alternatives.length > 0 && (
                      <button onClick={() => toggleExpanded(group.key)} className="flex w-full items-center gap-2 border-b border-slate-800/70 bg-slate-950/35 px-12 py-2 text-left text-[9px] font-semibold text-slate-600 hover:text-cyan-300">
                        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}{expanded ? 'Hide' : 'Show'} {alternatives.length} alternative match{alternatives.length === 1 ? '' : 'es'}
                      </button>
                    )}
                    {expanded ? alternatives.map((candidate) => renderRow(candidate, true)) : null}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-slate-800 bg-[#0b101a] xl:sticky xl:top-[80px] xl:h-[calc(100vh-96px)] xl:overflow-y-auto">
          {!inspected ? (
            <div className="grid h-full min-h-64 place-items-center p-8 text-center text-slate-600">Select a candidate to inspect.</div>
          ) : (
            <div>
              <div className="border-b border-slate-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="flex items-center gap-2"><h2 className="text-sm font-black text-slate-100">{inspected.symbol}</h2><span className={`rounded px-1.5 py-0.5 text-[9px] font-black ${inspected.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>{inspected.direction}</span></div><div className="mt-1 text-[10px] text-slate-500">{inspected.strategyCode} · {inspected.strategyName}</div></div>
                  <div className="text-right"><div className="text-xl font-black text-cyan-300">{inspected.qualityScore}</div><div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Quality</div></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[9px] text-slate-500">{inspected.tf}</span><span className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[9px] text-slate-500">{inspected.marketRegime.replaceAll('_', ' ')}</span>{isResearchOnly(inspected) && <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-300">RESEARCH ONLY</span>}</div>
              </div>

              <div className="space-y-4 p-4">
                <div><div className="mb-2 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Snapshot</div><div className="grid grid-cols-2 gap-2"><div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Price</div><div className="mt-1 font-black text-slate-200">${formatPrice(inspected.price)}</div></div><div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Timestamp</div><div className="mt-1 font-semibold text-slate-400">{new Date(inspected.timestamp).toLocaleTimeString([], { hour12: false })}</div></div></div></div>

                <div>
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Pipeline gates</div>
                  <div className="space-y-1.5">
                    {stageLabels.map(([key, label]) => {
                      const passed = inspected.stageResults[key];
                      return <div key={key} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-2.5 py-2"><span className="text-[10px] text-slate-500">{label}</span><span className={`flex items-center gap-1 text-[9px] font-bold ${passed ? 'text-emerald-300' : 'text-rose-300'}`}>{passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{passed ? 'PASS' : 'FAIL'}</span></div>;
                    })}
                  </div>
                </div>

                <div><div className="mb-2 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Evidence components</div><div className="grid grid-cols-2 gap-2"><div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Structure</div><div className="mt-1 font-black text-slate-200">{inspected.structureScore}</div></div><div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Derivatives</div><div className="mt-1 font-black text-slate-200">{inspected.derivativesScore}</div></div></div></div>

                <button onClick={() => onSelectCandidate(inspected)} className="flex w-full items-center justify-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 font-bold text-cyan-300 hover:bg-cyan-500/15">Open full decision <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
