// Global Command Palette (CMD + K) - Blueprint Section 6
import React, { useState, useEffect } from 'react';
import { SymbolInfo } from '../types';
import { Search, Zap, BarChart3, ShieldAlert, Cpu, BookOpen, Layers, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: SymbolInfo[];
  onSelectSymbol: (symbol: string) => void;
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onRunScan?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  symbols,
  onSelectSymbol,
  onNavigateTab,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  const handleNav = (tab: string) => {
    const targetTab = tab === 'paper' ? 'paper-trading' : tab;
    if (onNavigateTab) onNavigateTab(targetTab);
    else if (onNavigate) onNavigate(targetTab);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSymbols = symbols.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.baseAsset.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { id: 'prime-check', label: 'Open Decision Board', icon: Cpu, tab: 'opportunities' },
    { id: 'scanner', label: 'Open Multi-Stage Scanner', icon: Zap, tab: 'scanner' },
    { id: 'markets', label: 'Search the Market Universe', icon: Search, tab: 'markets' },
    { id: 'paper', label: 'Open Paper Trading Workspace', icon: BarChart3, tab: 'paper-trading' },
    { id: 'backtest', label: 'Open Replay and Backtest Lab', icon: Layers, tab: 'replay' },
    { id: 'journal', label: 'Open Paper Journal', icon: BookOpen, tab: 'paper-trading' },
    { id: 'risk', label: 'Review Trade Plan and Risk', icon: ShieldAlert, tab: 'trade-plan' },
  ].filter((action) => action.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4 font-mono text-xs">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950 space-x-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets (BTC, ETH, SOL), actions, or commands..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-bold focus:outline-none text-sm"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-4">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-3xs font-extrabold text-slate-500 uppercase tracking-wider">
                SYSTEM ACTIONS & WORKSPACES
              </div>
              <div className="space-y-1 mt-1">
                {quickActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        handleNav(act.tab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition text-slate-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold">{act.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Markets Match */}
          <div>
            <div className="px-3 py-1 text-3xs font-extrabold text-slate-500 uppercase tracking-wider">
              MARKET INSTRUMENTS ({filteredSymbols.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredSymbols.map((sym) => (
                <button
                  key={sym.symbol}
                  onClick={() => {
                    onSelectSymbol(sym.symbol);
                    onNavigateTab('workspace');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-cyan-400 text-3xs">
                      {sym.baseAsset.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-100">{sym.symbol}</div>
                      <div className="text-3xs text-slate-400">
                        {sym.baseAsset} / {sym.quoteAsset} PERPETUAL FUTURES
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-3xs font-bold">
                      {sym.maxLeverage}x MAX LEV
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950 text-3xs text-slate-500 flex justify-between items-center">
          <span>Use ▲ ▼ to navigate • Enter to select</span>
          <span className="text-cyan-400">SIGNAL DESK COMMAND ENGINE</span>
        </div>
      </div>
    </div>
  );
};
