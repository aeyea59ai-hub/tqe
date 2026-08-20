// Full-Screen Market Picker Sheet / Modal - Blueprint Section 5
import React, { useState } from 'react';
import { SymbolInfo, ScanCandidate, CanonicalSnapshot } from '../types';
import { isSymbolFavorite, toggleFavoriteSymbol } from '../lib/watchlistStore';
import { useMarketStore } from '../lib/marketStore';
import { Search, Star, X, TrendingUp, TrendingDown, Activity, Sparkles, Check, Flame } from 'lucide-react';

interface MarketPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: SymbolInfo[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  candidates?: ScanCandidate[];
  snapshotMap?: Record<string, CanonicalSnapshot>;
}

export const MarketPickerModal: React.FC<MarketPickerModalProps> = ({
  isOpen,
  onClose,
  symbols,
  selectedSymbol,
  onSelectSymbol,
  candidates = [],
  snapshotMap = {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryTab, setPrimaryTab] = useState<'FAVORITES' | 'USDT_M' | 'QUALIFIED' | 'ALL'>('USDT_M');
  const [filterMode, setFilterMode] = useState<'ALL' | 'GAINERS' | 'LOSERS' | 'VOLUME'>('ALL');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('signal_desk_favorites') || '["BTCUSDT","ETHUSDT","SOLUSDT"]');
    } catch {
      return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    }
  });

  const marketStore = useMarketStore();

  if (!isOpen) return null;

  const handleToggleFavorite = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const updated = toggleFavoriteSymbol(symbol);
    setFavorites([...updated]);
  };

  const qualifiedSymbols = candidates.map((c) => c.symbol);

  // Filter logic
  let filtered = symbols.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = s.symbol.toLowerCase().includes(q) || s.baseAsset.toLowerCase().includes(q);
    if (!matchesQuery) return false;

    if (primaryTab === 'FAVORITES') return favorites.includes(s.symbol);
    if (primaryTab === 'QUALIFIED') return qualifiedSymbols.includes(s.symbol);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/85 font-mono text-xs backdrop-blur-md sm:items-center sm:p-4">
      <div className="flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl sm:h-[90vh] sm:max-h-[750px] sm:rounded-xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                MARKET SELECTOR & WATCHLIST
              </h3>
              <p className="text-3xs text-slate-400">
                SEARCH ALL PERPETUAL FUTURES PAIRS & QUALIFIED CANDIDATES
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbol (BTC, ETH, SOL, XRP)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-100 text-xs font-bold focus:border-cyan-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Primary Navigation Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setPrimaryTab('FAVORITES')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-2xs font-extrabold transition whitespace-nowrap ${
                primaryTab === 'FAVORITES'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>FAVORITES ({favorites.length})</span>
            </button>

            <button
              onClick={() => setPrimaryTab('USDT_M')}
              className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition whitespace-nowrap ${
                primaryTab === 'USDT_M'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              USDⓈ-M PERPETUALS
            </button>

            <button
              onClick={() => setPrimaryTab('QUALIFIED')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-2xs font-extrabold transition whitespace-nowrap ${
                primaryTab === 'QUALIFIED'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>QUALIFIED ({qualifiedSymbols.length})</span>
            </button>

            <button
              onClick={() => setPrimaryTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition whitespace-nowrap ${
                primaryTab === 'ALL'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              ALL MARKETS ({symbols.length})
            </button>
          </div>
        </div>

        {/* Market Rows */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No matching instruments found for query "{searchQuery}"
            </div>
          ) : (
            filtered.map((sym) => {
              const isFav = favorites.includes(sym.symbol);
              const isSelected = sym.symbol === selectedSymbol;
              const snapshot = snapshotMap[sym.symbol];
              const candidate = candidates.find((c) => c.symbol === sym.symbol);
              
              const marketItem = marketStore.find(m => m.symbol === sym.symbol);

              // Real live prices from normalized store
              const currentPrice = marketItem?.lastPrice || snapshot?.currentPrice || 0;
              const priceChange24h = marketItem?.change24h || 0;
              const volume24h = marketItem?.volume24h || 0;
              const funding = marketItem?.fundingRate || 0;

              return (
                <div
                  key={sym.symbol}
                  onClick={() => {
                    onSelectSymbol(sym.symbol);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Star + Icon + Symbol */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => handleToggleFavorite(e, sym.symbol)}
                      className={`p-1 rounded transition ${
                        isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-cyan-400 text-xs">
                      {sym.baseAsset.slice(0, 3)}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-100">
                          {sym.symbol}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 text-3xs font-bold">
                          PERP
                        </span>
                        {candidate && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-3xs font-extrabold">
                            {candidate.strategyCode} SCORE {candidate.qualityScore}
                          </span>
                        )}
                      </div>
                      <div className="text-3xs text-slate-400 mt-0.5">
                        Vol: ${(volume24h / 1e6).toFixed(1)}M • Funding: {funding >= 0 ? '+' : ''}{(funding * 100).toFixed(4)}%
                      </div>
                    </div>
                  </div>

                  {/* Right: Price + 24h Change */}
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-100">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: currentPrice < 10 ? 4 : 2, maximumFractionDigits: currentPrice < 10 ? 4 : 2 })}
                    </div>
                    <div
                      className={`text-2xs font-black flex items-center justify-end space-x-0.5 ${
                        priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {priceChange24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {priceChange24h >= 0 ? '+' : ''}
                        {priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-3xs text-slate-400">
          <span>SELECTED: <strong className="text-cyan-400">{selectedSymbol}</strong></span>
          <span>SEARCH-FIRST MARKET PICKER • SIGNAL DESK UNIFIED V2</span>
        </div>
      </div>
    </div>
  );
};
