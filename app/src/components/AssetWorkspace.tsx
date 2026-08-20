import React from 'react';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Layers3,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AccountState, CanonicalSnapshot, CouncilDeliberation, ScanCandidate, SymbolInfo } from '../types';
import { AICouncilSummary } from './AICouncilSummary';
import { OrderBookDepth } from './OrderBookDepth';
import { PriceChart } from './PriceChart';
import { PriceSemanticBadge } from './PriceSemanticBadge';
import { useMarketStoreItem } from '../lib/marketStore';

interface AssetWorkspaceProps {
  snapshot: CanonicalSnapshot;
  symbols?: SymbolInfo[];
  candidate?: ScanCandidate;
  deliberation?: CouncilDeliberation | null;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  onSelectCandidate: (candidate: ScanCandidate) => void;
  onExecutePaperTrade?: () => void;
  accountState: AccountState;
  onSelectSymbol?: (symbol: string) => void;
  onNavigateTab?: (tab: string) => void;
}

type WorkspaceView = 'chart' | 'structure' | 'technical' | 'derivatives' | 'decisions' | 'ai';

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: value < 10 ? 4 : 2,
    maximumFractionDigits: value < 10 ? 6 : 2,
  });
}

const SectionHeader: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="border-b border-slate-800/90 px-4 py-3">
    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">{title}</div>
    <div className="mt-0.5 text-[9px] text-slate-600">{detail}</div>
  </div>
);

export const AssetWorkspace: React.FC<AssetWorkspaceProps> = ({
  snapshot,
  candidate,
  deliberation = null,
  selectedTimeframe,
  onTimeframeChange,
  accountState,
  onNavigateTab,
}) => {
  const [view, setView] = React.useState<WorkspaceView>('chart');
  const liveMarketItem = useMarketStoreItem(snapshot.symbol);
  const displayPrice = liveMarketItem?.lastPrice || snapshot.currentPrice;
  const displayMark = liveMarketItem?.markPrice || snapshot.derivatives.markPrice;
  const displayIndex = liveMarketItem?.indexPrice || snapshot.derivatives.indexPrice;

  const views: Array<{ id: WorkspaceView; label: string; description: string; icon: React.ElementType }> = [
    { id: 'chart', label: 'Chart', description: 'Candles and overlays', icon: BarChart3 },
    { id: 'structure', label: 'Structure', description: 'Swings, BOS, CHoCH and zones', icon: Layers3 },
    { id: 'technical', label: 'Technical', description: 'Deterministic indicator values', icon: Activity },
    { id: 'derivatives', label: 'Derivatives', description: 'Funding, OI and order-book depth', icon: CircleDollarSign },
    { id: 'decisions', label: 'Decision context', description: 'Current candidate and risk path', icon: Target },
    { id: 'ai', label: 'AI Review', description: 'Evidence summary and objections', icon: BrainCircuit },
  ];

  const qualityHealthy = snapshot.qualityReport.status === 'HEALTHY';
  const candidateResearchOnly =
    candidate && candidate.symbol !== 'BTCUSDT' && candidate.symbol !== 'ETHUSDT';

  return (
    <div className="space-y-4 font-mono text-xs text-slate-100">
      <section className="border border-slate-800/90 bg-[#0a0f19]">
        <div className="flex flex-col gap-4 border-b border-slate-800/90 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-xs font-black text-cyan-300">
              {snapshot.symbol.replace('USDT', '').slice(0, 4)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-base font-black text-slate-50">{snapshot.symbol}</h2>
                <span className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[9px] font-bold text-slate-500">USDⓈ-M PERPETUAL</span>
                <span className="rounded border border-cyan-500/20 bg-cyan-500/[0.06] px-2 py-0.5 text-[9px] font-black text-cyan-300">
                  {snapshot.regime.replaceAll('_', ' ')}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-600">
                <span>{snapshot.providerProvenance}</span>
                <span>·</span>
                <span>{selectedTimeframe} context</span>
                <span>·</span>
                <span className={qualityHealthy ? 'text-emerald-400' : 'text-amber-400'}>
                  {snapshot.qualityReport.status} · {snapshot.qualityReport.freshnessMs} ms
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PriceSemanticBadge
              type="LIVE_LAST"
              price={displayPrice}
              timestamp={liveMarketItem?.timestamp || snapshot.timestamp}
              source="BINANCE_FUTURES"
            />
            <PriceSemanticBadge
              type="MARK_PRICE"
              price={displayMark}
              timestamp={liveMarketItem?.timestamp || snapshot.timestamp}
              source="MARK_CALCULATED"
            />
            <PriceSemanticBadge
              type="INDEX_PRICE"
              price={displayIndex}
              timestamp={liveMarketItem?.timestamp || snapshot.timestamp}
              source="INDEX_COMPOSITE"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-slate-800/70 sm:grid-cols-4 xl:grid-cols-8 xl:divide-y-0">
          {[
            ['Funding', `${(snapshot.derivatives.fundingRate * 100).toFixed(4)}%`, snapshot.derivatives.fundingRate >= 0 ? 'text-emerald-300' : 'text-rose-300'],
            ['Open interest', `$${(snapshot.derivatives.openInterestUsd / 1e6).toFixed(1)}M`, 'text-violet-300'],
            ['Long / short', snapshot.derivatives.longShortRatio.toFixed(2), 'text-cyan-300'],
            ['Taker buy', `${(snapshot.derivatives.takerBuyRatio * 100).toFixed(1)}%`, 'text-amber-300'],
            ['Spread', `${formatPrice(snapshot.orderBook.spread)}`, 'text-slate-200'],
            ['Book imbalance', `${snapshot.orderBook.imbalanceRatio.toFixed(2)}x`, 'text-slate-200'],
            ['EMA 20 / 50', `${formatPrice(snapshot.features.ema20)} / ${formatPrice(snapshot.features.ema50)}`, 'text-cyan-200'],
            ['RSI 14', snapshot.features.rsi14.toFixed(1), 'text-amber-300'],
          ].map(([label, value, tone]) => (
            <div key={label} className="min-w-0 px-3 py-3">
              <div className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-700">{label}</div>
              <div className={`mt-1 truncate text-[10px] font-black ${tone}`}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="h-fit border border-slate-800/90 bg-[#0a0f19]">
          <SectionHeader title="Workspace" detail="Single-symbol analysis views" />
          <nav className="flex gap-1 overflow-x-auto p-2 xl:block xl:space-y-1" aria-label="Asset workspace views">
            {views.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`min-w-[150px] rounded-lg border px-3 py-2.5 text-left xl:min-w-0 xl:w-full ${
                    active
                      ? 'border-cyan-500/30 bg-cyan-500/10'
                      : 'border-transparent hover:border-slate-800 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${active ? 'text-cyan-300' : 'text-slate-600'}`} />
                    <span className={`text-[10px] font-black ${active ? 'text-cyan-200' : 'text-slate-300'}`}>{item.label}</span>
                  </div>
                  <div className="mt-1 hidden pl-6 text-[9px] leading-snug text-slate-600 xl:block">{item.description}</div>
                </button>
              );
            })}
          </nav>
          {onNavigateTab && (
            <div className="border-t border-slate-800/90 p-2">
              <button
                onClick={() => onNavigateTab('trade-plan')}
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-[9px] font-black text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300"
              >
                Open Trade Plan <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </aside>

        <main className="min-w-0">
          {view === 'chart' && (
            <section className="border border-slate-800/90 bg-[#0a0f19] p-3 sm:p-4">
              <PriceChart snapshot={snapshot} onTimeframeChange={onTimeframeChange} />
            </section>
          )}

          {view === 'structure' && (
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="border border-slate-800/90 bg-[#0a0f19]">
                <SectionHeader title="Structure breaks" detail="Confirmed market-structure events" />
                <div className="space-y-3 p-4">
                  <div className="border border-slate-800 bg-slate-950 p-3">
                    <div className="text-[9px] uppercase tracking-wide text-slate-600">Last BOS</div>
                    <div className="mt-1 text-[10px] font-black text-emerald-300">
                      {snapshot.structure.lastBos?.type || 'Unavailable'} {snapshot.structure.lastBos ? `@ ${formatPrice(snapshot.structure.lastBos.price)}` : ''}
                    </div>
                  </div>
                  <div className="border border-slate-800 bg-slate-950 p-3">
                    <div className="text-[9px] uppercase tracking-wide text-slate-600">Last CHoCH</div>
                    <div className="mt-1 text-[10px] font-black text-amber-300">
                      {snapshot.structure.lastChoch?.type || 'Unavailable'} {snapshot.structure.lastChoch ? `@ ${formatPrice(snapshot.structure.lastChoch.price)}` : ''}
                    </div>
                  </div>
                  <div className="text-[9px] leading-relaxed text-slate-600">
                    {snapshot.structure.isRanging ? 'Range structure detected.' : 'Directional structure active.'}
                    {snapshot.structure.isCompressing ? ' Volatility compression is also active.' : ''}
                  </div>
                </div>
              </section>

              <section className="border border-slate-800/90 bg-[#0a0f19]">
                <SectionHeader title={`Fair value gaps (${snapshot.structure.fvgs.length})`} detail="Current deterministic FVG inventory" />
                <div className="max-h-80 divide-y divide-slate-800/70 overflow-y-auto">
                  {snapshot.structure.fvgs.length ? snapshot.structure.fvgs.map((gap) => (
                    <div key={gap.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className={`text-[9px] font-black ${gap.type === 'BULLISH_FVG' ? 'text-emerald-300' : 'text-rose-300'}`}>{gap.type}</span>
                      <span className="font-mono text-[9px] text-slate-400">{formatPrice(gap.bottom)}–{formatPrice(gap.top)}</span>
                    </div>
                  )) : <div className="p-6 text-center text-[10px] text-slate-600">No FVG records in this snapshot.</div>}
                </div>
              </section>

              <section className="border border-slate-800/90 bg-[#0a0f19]">
                <SectionHeader title={`Liquidity sweeps (${snapshot.structure.sweeps.length})`} detail="Confirmed sweep events" />
                <div className="max-h-80 divide-y divide-slate-800/70 overflow-y-auto">
                  {snapshot.structure.sweeps.length ? snapshot.structure.sweeps.map((sweep) => (
                    <div key={sweep.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="text-[9px] font-black text-amber-300">{sweep.type}</span>
                      <span className="font-mono text-[9px] text-slate-400">{formatPrice(sweep.price)}</span>
                    </div>
                  )) : <div className="p-6 text-center text-[10px] text-slate-600">No sweep records in this snapshot.</div>}
                </div>
              </section>
            </div>
          )}

          {view === 'technical' && (
            <section className="border border-slate-800/90 bg-[#0a0f19]">
              <SectionHeader title="Technical indicators" detail="Values supplied by the existing deterministic feature bundle" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  ['EMA 7', snapshot.features.ema7],
                  ['EMA 20', snapshot.features.ema20],
                  ['EMA 50', snapshot.features.ema50],
                  ['EMA 99', snapshot.features.ema99],
                  ['EMA 200', snapshot.features.ema200],
                  ['VWAP', snapshot.features.vwap],
                  ['ATR 14', snapshot.features.atr14],
                  ['MACD histogram', snapshot.features.macd.histogram],
                  ['RSI 14', snapshot.features.rsi14],
                  ['Volume ratio', snapshot.features.volumeRatio],
                  ['Realized volatility', snapshot.features.realizedVolatility],
                  ['BB width', snapshot.features.bollinger.bandwidth],
                ].map(([label, raw]) => (
                  <div key={String(label)} className="border-b border-r border-slate-800/70 p-4">
                    <div className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-600">{label}</div>
                    <div className="mt-2 font-mono text-xs font-black text-slate-200">{Number(raw).toFixed(4)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === 'derivatives' && <OrderBookDepth snapshot={snapshot} />}

          {view === 'decisions' && (
            <section className="border border-slate-800/90 bg-[#0a0f19]">
              <SectionHeader title="Decision context" detail="Current candidate context without mixing execution into this page" />
              {candidate ? (
                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  <div className="border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.14em] text-slate-600">Strategy match</div>
                        <div className="mt-1 text-xs font-black text-slate-100">{candidate.strategyCode} · {candidate.strategyName}</div>
                      </div>
                      <span className={`rounded px-2 py-1 text-[9px] font-black ${candidate.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>{candidate.direction}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div><div className="text-[9px] text-slate-600">Quality score</div><div className="mt-1 text-lg font-black text-cyan-300">{candidate.qualityScore}</div></div>
                      <div><div className="text-[9px] text-slate-600">Timeframe</div><div className="mt-1 text-lg font-black text-slate-200">{candidate.tf}</div></div>
                    </div>
                  </div>
                  <div className="border border-slate-800 bg-slate-950 p-4">
                    <div className="text-[9px] uppercase tracking-[0.14em] text-slate-600">Eligibility</div>
                    <div className={`mt-2 text-xs font-black ${candidateResearchOnly ? 'text-amber-300' : 'text-emerald-300'}`}>
                      {candidateResearchOnly ? 'RESEARCH ONLY' : 'PUBLISHABLE SYMBOL'}
                    </div>
                    <div className="mt-3 text-[9px] leading-relaxed text-slate-600">
                      Full entry, stop, target and risk controls live in the dedicated Trade Plan workspace.
                    </div>
                  </div>
                  {onNavigateTab && (
                    <button onClick={() => onNavigateTab('trade-plan')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-[10px] font-black text-cyan-200 lg:col-span-2">
                      Open deterministic trade plan <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid min-h-64 place-items-center p-6 text-center">
                  <div>
                    <Radar className="mx-auto h-7 w-7 text-slate-700" />
                    <div className="mt-3 text-xs font-black text-slate-300">No candidate selected</div>
                    <div className="mt-1 text-[10px] text-slate-600">Select a scanner result to attach decision context to this asset.</div>
                  </div>
                </div>
              )}
            </section>
          )}

          {view === 'ai' && (
            <AICouncilSummary
              deliberation={deliberation}
              snapshot={snapshot}
              onNavigateTab={onNavigateTab || (() => undefined)}
            />
          )}
        </main>

        <aside className="h-fit space-y-4">
          <section className="border border-slate-800/90 bg-[#0a0f19]">
            <SectionHeader title="Market inspector" detail="Frozen symbol context" />
            <dl className="divide-y divide-slate-800/70 px-4">
              {[
                ['Last price', `$${formatPrice(displayPrice)}`],
                ['Mark price', `$${formatPrice(displayMark)}`],
                ['Index price', `$${formatPrice(displayIndex)}`],
                ['Regime', snapshot.regime.replaceAll('_', ' ')],
                ['Data quality', snapshot.qualityReport.status],
                ['Snapshot ID', snapshot.snapshotId],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[9px] text-slate-600">{label}</dt>
                  <dd className="max-w-[170px] truncate text-right font-mono text-[9px] font-bold text-slate-300" title={String(value)}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border border-slate-800/90 bg-[#0a0f19]">
            <SectionHeader title="Paper account" detail="Compact context only" />
            <div className="grid grid-cols-2">
              <div className="border-r border-slate-800/70 p-4">
                <div className="text-[9px] text-slate-600">Equity</div>
                <div className="mt-1 text-xs font-black text-slate-200">${accountState.equity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-4">
                <div className="text-[9px] text-slate-600">Open positions</div>
                <div className="mt-1 text-xs font-black text-cyan-300">{accountState.positions.length}</div>
              </div>
            </div>
            {onNavigateTab && (
              <button onClick={() => onNavigateTab('paper-trading')} className="flex w-full items-center justify-between border-t border-slate-800/90 px-4 py-3 text-[9px] font-black text-slate-400 hover:bg-slate-900/60 hover:text-cyan-300">
                Open Paper workspace <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </section>

          <section className="border border-slate-800/90 bg-[#0a0f19] p-4">
            <div className="flex items-start gap-3">
              {qualityHealthy ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> : <ShieldCheck className="mt-0.5 h-4 w-4 text-amber-400" />}
              <div>
                <div className="text-[10px] font-black text-slate-200">Workspace safety</div>
                <div className="mt-1 text-[9px] leading-relaxed text-slate-600">
                  The asset page displays existing market context. It does not replace the scanner, Risk Engine or Paper confirmation flow.
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
