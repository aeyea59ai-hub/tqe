import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Flame,
  Radar,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CanonicalSnapshot, ScanCandidate, SymbolInfo } from '../types';
import { getFavoriteSymbols, toggleFavoriteSymbol } from '../lib/watchlistStore';
import { useMarketStore } from '../lib/marketStore';

interface MarketsPageProps {
  symbols: SymbolInfo[];
  candidates: ScanCandidate[];
  snapshotMap: Record<string, CanonicalSnapshot>;
  onSelectSymbol: (symbol: string) => void;
  onNavigateTab: (tab: string) => void;
}

type MarketFilter = 'ALL' | 'FAVORITES' | 'QUALIFIED' | 'GAINERS' | 'LOSERS' | 'LONG' | 'SHORT';

function formatPrice(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value < 10 ? 4 : 2,
    maximumFractionDigits: value < 10 ? 4 : 2,
  });
}

export const MarketsPage: React.FC<MarketsPageProps> = ({
  symbols = [],
  candidates = [],
  snapshotMap = {},
  onSelectSymbol,
  onNavigateTab,
}) => {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<MarketFilter>('ALL');
  const [favorites, setFavorites] = React.useState<string[]>(() => getFavoriteSymbols());
  const [selectedSymbol, setSelectedSymbol] = React.useState<string>('BTCUSDT');
  const marketStore = useMarketStore();

  const marketMap = React.useMemo(() => new Map(marketStore.map((item) => [item.symbol, item])), [marketStore]);
  const candidateMap = React.useMemo(() => {
    const map = new Map<string, ScanCandidate>();
    for (const candidate of [...candidates].sort((a, b) => b.qualityScore - a.qualityScore)) {
      if (!map.has(candidate.symbol)) map.set(candidate.symbol, candidate);
    }
    return map;
  }, [candidates]);

  const filteredSymbols = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return symbols.filter((symbol) => {
      if (normalized && !symbol.symbol.toLowerCase().includes(normalized) && !symbol.baseAsset.toLowerCase().includes(normalized)) return false;
      const market = marketMap.get(symbol.symbol);
      const candidate = candidateMap.get(symbol.symbol);
      const change = market?.change24h ?? 0;
      if (filter === 'FAVORITES') return favorites.includes(symbol.symbol);
      if (filter === 'QUALIFIED') return Boolean(candidate);
      if (filter === 'GAINERS') return change > 0;
      if (filter === 'LOSERS') return change < 0;
      if (filter === 'LONG') return candidate?.direction === 'LONG';
      if (filter === 'SHORT') return candidate?.direction === 'SHORT';
      return true;
    });
  }, [candidateMap, favorites, filter, marketMap, query, symbols]);

  React.useEffect(() => {
    if (filteredSymbols.some((symbol) => symbol.symbol === selectedSymbol)) return;
    setSelectedSymbol(filteredSymbols[0]?.symbol || symbols[0]?.symbol || 'BTCUSDT');
  }, [filteredSymbols, selectedSymbol, symbols]);

  const selectedInfo = symbols.find((symbol) => symbol.symbol === selectedSymbol);
  const selectedMarket = marketMap.get(selectedSymbol);
  const selectedSnapshot = snapshotMap[selectedSymbol];
  const selectedCandidate = candidateMap.get(selectedSymbol);

  const toggleFavorite = (symbol: string) => setFavorites([...toggleFavoriteSymbol(symbol)]);

  const filters: Array<{ id: MarketFilter; label: string; icon?: React.ElementType; count?: number }> = [
    { id: 'ALL', label: 'All markets', icon: BarChart3, count: symbols.length },
    { id: 'FAVORITES', label: 'Favorites', icon: Star, count: favorites.length },
    { id: 'QUALIFIED', label: 'Scanner matches', icon: Flame, count: candidateMap.size },
    { id: 'GAINERS', label: 'Top gainers', icon: TrendingUp },
    { id: 'LOSERS', label: 'Top losers', icon: TrendingDown },
    { id: 'LONG', label: 'Long bias' },
    { id: 'SHORT', label: 'Short bias' },
  ];

  const openWorkspace = (symbol = selectedSymbol) => {
    onSelectSymbol(symbol);
    onNavigateTab('workspace');
  };

  return (
    <div className="grid gap-3 font-mono text-xs text-slate-100 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
      <aside className="rounded-lg border border-slate-800 bg-[#0b101a] p-3 xl:sticky xl:top-[80px] xl:h-[calc(100vh-96px)] xl:overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <BarChart3 className="h-4 w-4 text-cyan-400" />
          <div><div className="font-black uppercase tracking-[0.12em] text-slate-300">Market universe</div><div className="mt-0.5 text-[9px] text-slate-600">Search-first discovery and favorites</div></div>
        </div>

        <label className="mt-3 flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2">
          <Search className="h-3.5 w-3.5 text-slate-600" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="BTC, ETH, SOL…" className="min-w-0 flex-1 bg-transparent text-[11px] text-slate-200 outline-none placeholder:text-slate-700" />
        </label>

        <div className="mt-4 space-y-1">
          {filters.map((item) => {
            const Icon = item.icon;
            const active = filter === item.id;
            return (
              <button key={item.id} onClick={() => setFilter(item.id)} className={`flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left ${active ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200' : 'border-transparent text-slate-500 hover:border-slate-800 hover:bg-slate-950/70 hover:text-slate-200'}`}>
                <span className="flex items-center gap-2">{Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />}<span className="text-[10px] font-semibold">{item.label}</span></span>
                {item.count !== undefined && <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[9px] text-slate-600">{item.count}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Workflow</div>
          <ol className="mt-2 space-y-2 text-[10px] text-slate-500">
            <li className="flex gap-2"><span className="text-cyan-400">1</span> Browse or search a market.</li>
            <li className="flex gap-2"><span className="text-cyan-400">2</span> Preview context in the inspector.</li>
            <li className="flex gap-2"><span className="text-cyan-400">3</span> Open the focused Asset Workspace.</li>
          </ol>
        </div>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0b101a]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-3 py-3 sm:px-4">
          <div><h2 className="font-black uppercase tracking-[0.12em] text-slate-300">USDⓈ-M perpetual markets</h2><p className="mt-0.5 text-[9px] text-slate-600">Select a row to preview. Open Workspace for symbol-specific analysis.</p></div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[9px] font-bold text-slate-600">{filteredSymbols.length} shown</span>
            <button onClick={() => onNavigateTab('scanner')} className="flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/15"><Radar className="h-3.5 w-3.5" /> Open scanner</button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-148px)] overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#0b101a]"><tr className="border-b border-slate-800 text-[9px] uppercase tracking-[0.12em] text-slate-600"><th className="w-10 px-3 py-2.5">Fav</th><th className="px-3 py-2.5">Market</th><th className="px-3 py-2.5">Last price</th><th className="px-3 py-2.5">24h</th><th className="px-3 py-2.5">Volume</th><th className="px-3 py-2.5">Funding</th><th className="px-3 py-2.5">Scanner</th><th className="px-3 py-2.5 text-right">Open</th></tr></thead>
            <tbody>
              {filteredSymbols.map((symbol) => {
                const market = marketMap.get(symbol.symbol);
                const snapshot = snapshotMap[symbol.symbol];
                const candidate = candidateMap.get(symbol.symbol);
                const price = market?.lastPrice || snapshot?.currentPrice || 0;
                const change = market?.change24h ?? 0;
                const favorite = favorites.includes(symbol.symbol);
                const selected = selectedSymbol === symbol.symbol;
                return (
                  <tr key={symbol.symbol} onClick={() => setSelectedSymbol(symbol.symbol)} className={`cursor-pointer border-b border-slate-800/70 last:border-b-0 ${selected ? 'bg-cyan-500/[0.07]' : 'hover:bg-slate-900/55'}`}>
                    <td className="px-3 py-3"><button onClick={(event) => { event.stopPropagation(); toggleFavorite(symbol.symbol); }} className={`rounded p-1 ${favorite ? 'text-amber-300' : 'text-slate-700 hover:text-slate-400'}`} aria-label={`${favorite ? 'Remove' : 'Add'} ${symbol.symbol} favorite`}><Star className={`h-3.5 w-3.5 ${favorite ? 'fill-current' : ''}`} /></button></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2.5"><div className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-slate-950 text-[9px] font-black text-cyan-300">{symbol.baseAsset.slice(0, 3)}</div><div><div className="font-black text-slate-100">{symbol.symbol}</div><div className="mt-0.5 text-[9px] text-slate-600">USDT perpetual</div></div></div></td>
                    <td className="px-3 py-3 font-semibold text-slate-300">${formatPrice(price)}</td>
                    <td className={`px-3 py-3 font-black ${change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</td>
                    <td className="px-3 py-3 text-[10px] text-slate-500">{market?.volume24h ? `$${(market.volume24h / 1e6).toFixed(1)}M` : '—'}</td>
                    <td className="px-3 py-3 text-[10px] text-slate-500">{market?.fundingRate !== undefined ? `${(market.fundingRate * 100).toFixed(4)}%` : '—'}</td>
                    <td className="px-3 py-3">{candidate ? <div className="flex items-center gap-1.5"><span className={`rounded px-1.5 py-0.5 text-[9px] font-black ${candidate.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>{candidate.direction}</span><span className="text-[9px] font-semibold text-slate-500">{candidate.strategyCode} · {candidate.qualityScore}</span></div> : <span className="text-[9px] text-slate-700">No current match</span>}</td>
                    <td className="px-3 py-3 text-right"><button onClick={(event) => { event.stopPropagation(); openWorkspace(symbol.symbol); }} className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300">Workspace <ChevronRight className="h-3 w-3" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSymbols.length === 0 && <div className="grid min-h-64 place-items-center p-8 text-center"><div><Search className="mx-auto h-6 w-6 text-slate-700" /><div className="mt-3 font-semibold text-slate-400">No markets match</div><div className="mt-1 text-[10px] text-slate-600">Change the search or market filter.</div></div></div>}
        </div>
      </section>

      <aside className="rounded-lg border border-slate-800 bg-[#0b101a] xl:sticky xl:top-[80px] xl:h-[calc(100vh-96px)] xl:overflow-y-auto">
        {!selectedInfo ? (
          <div className="grid h-full min-h-64 place-items-center p-8 text-center text-slate-600">Select a market to preview.</div>
        ) : (
          <div>
            <div className="border-b border-slate-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-[10px] font-black text-cyan-300">{selectedInfo.baseAsset.slice(0, 3)}</div><div><h2 className="text-sm font-black text-slate-100">{selectedInfo.symbol}</h2><div className="mt-0.5 text-[9px] text-slate-600">USDⓈ-M perpetual</div></div></div>
                <button onClick={() => toggleFavorite(selectedInfo.symbol)} className={`rounded-md border border-slate-800 p-2 ${favorites.includes(selectedInfo.symbol) ? 'text-amber-300' : 'text-slate-600'}`}><Star className={`h-3.5 w-3.5 ${favorites.includes(selectedInfo.symbol) ? 'fill-current' : ''}`} /></button>
              </div>
              <div className="mt-4 flex items-end justify-between"><div><div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Last price</div><div className="mt-1 text-lg font-black text-slate-100">${formatPrice(selectedMarket?.lastPrice || selectedSnapshot?.currentPrice || 0)}</div></div><div className={`font-black ${(selectedMarket?.change24h ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{(selectedMarket?.change24h ?? 0) >= 0 ? '+' : ''}{(selectedMarket?.change24h ?? 0).toFixed(2)}%</div></div>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Funding</div><div className="mt-1 font-bold text-slate-300">{selectedMarket?.fundingRate !== undefined ? `${(selectedMarket.fundingRate * 100).toFixed(4)}%` : '—'}</div></div>
                <div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Open interest</div><div className="mt-1 font-bold text-slate-300">{selectedMarket?.openInterest ? `$${(selectedMarket.openInterest / 1e6).toFixed(1)}M` : '—'}</div></div>
                <div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Max leverage</div><div className="mt-1 font-bold text-slate-300">{selectedInfo.maxLeverage}x</div></div>
                <div className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"><div className="text-[9px] text-slate-600">Status</div><div className="mt-1 font-bold text-emerald-300">{selectedInfo.status}</div></div>
              </div>

              <div>
                <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">Scanner context</div>
                {selectedCandidate ? (
                  <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between"><span className={`rounded px-1.5 py-0.5 text-[9px] font-black ${selectedCandidate.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>{selectedCandidate.direction}</span><span className="text-base font-black text-cyan-300">{selectedCandidate.qualityScore}</span></div>
                    <div className="mt-2 font-semibold text-slate-300">{selectedCandidate.strategyCode} · {selectedCandidate.strategyName}</div>
                    <div className="mt-1 text-[9px] text-slate-600">{selectedCandidate.marketRegime.replaceAll('_', ' ')}</div>
                    {selectedInfo.symbol !== 'BTCUSDT' && selectedInfo.symbol !== 'ETHUSDT' && <div className="mt-2 text-[9px] font-bold text-amber-300">RESEARCH ONLY</div>}
                  </div>
                ) : <div className="rounded-md border border-dashed border-slate-800 p-3 text-[10px] text-slate-600">No current scanner match for this market.</div>}
              </div>

              <button onClick={() => openWorkspace()} className="flex w-full items-center justify-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 font-bold text-cyan-300 hover:bg-cyan-500/15">Open Asset Workspace <ArrowRight className="h-3.5 w-3.5" /></button>
              {selectedCandidate && <button onClick={() => { onSelectSymbol(selectedInfo.symbol); onNavigateTab('opportunities'); }} className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-100">Review decision evidence</button>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
