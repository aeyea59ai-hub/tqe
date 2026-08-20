// Header Component for SIGNAL DESK UNIFIED v2.0
import React from 'react';
import { Activity, Bot, Cpu, Layers, ShieldCheck, Play, LineChart, FileText, RefreshCw, Lock, Search, Sparkles, Home, BarChart3, Zap } from 'lucide-react';
import { AccountState, QualityReport } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  qualityReport: QualityReport;
  accountState: AccountState;
  selectedSymbol: string;
  onRefreshData: () => void;
  onOpenAuditLog: () => void;
  onOpenCommandPalette: () => void;
  onOpenMarketPicker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  qualityReport,
  accountState,
  selectedSymbol,
  onRefreshData,
  onOpenAuditLog,
  onOpenCommandPalette,
  onOpenMarketPicker,
}) => {
  const getQualityBadgeColor = () => {
    switch (qualityReport.status) {
      case 'HEALTHY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'DEGRADED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'INSUFFICIENT':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'BLOCKED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Command Home', icon: Home },
    { id: 'markets', label: 'Markets', icon: BarChart3 },
    { id: 'workspace', label: 'Asset Workspace', icon: LineChart },
    { id: 'agents-live', label: 'QuantAgents Live', icon: Bot },
    { id: 'scanner', label: 'Multi-Stage Scanner', icon: Zap },
    { id: 'opportunities', label: 'Batch AI Review', icon: Bot },
    { id: 'trade-plan', label: 'Trade Plan', icon: Cpu },
    { id: 'paper-trading', label: 'Paper Desk', icon: Activity },
    { id: 'replay', label: 'Replay / Backtest', icon: Play },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 select-none sticky top-0 z-40">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-slate-900 text-xs gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-bold tracking-wider text-cyan-400">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-sm font-mono tracking-widest uppercase">SIGNAL DESK UNIFIED v2.0</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 font-mono hidden sm:inline">BINANCE USDⓈ-M FUTURES</span>
          <span className="text-slate-600">|</span>

          {/* Market Picker Trigger Button */}
          <button
            onClick={onOpenMarketPicker}
            className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/80 font-bold hover:bg-cyan-900 transition flex items-center space-x-1.5"
            title="Click to search & pick market instrument"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedSymbol}</span>
            <span className="text-3xs text-cyan-400 bg-cyan-950 px-1 rounded">SELECT</span>
          </button>

          {/* CMD+K Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 text-2xs hover:text-slate-100 hover:border-slate-700 transition"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span>Quick Search</span>
            <kbd className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 font-bold text-3xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Status badges */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quality Gate Status */}
          <button
            onClick={onOpenAuditLog}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-2xs font-mono font-medium transition hover:brightness-125 ${getQualityBadgeColor()}`}
            title="Click to view SHA-256 Frozen Evidence Chain"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GATE: {qualityReport.status}</span>
            <span className="opacity-75 hidden sm:inline">({qualityReport.score}/100)</span>
          </button>

          {/* Daily Lockout indicator if active */}
          {accountState.dailyLockout && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 text-2xs font-mono">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>LOCKOUT</span>
            </div>
          )}

          {/* Paper Account Summary */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded font-mono text-2xs">
            <span className="text-slate-400 hidden sm:inline">PAPER BAL:</span>
            <span className="text-slate-100 font-semibold">${accountState.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 hidden sm:inline">EQ:</span>
            <span className={`font-semibold ${accountState.equity >= accountState.balance ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${accountState.equity.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefreshData}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh Data & Tickers"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-4 bg-slate-950/90 backdrop-blur overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (activeTab === 'terminal' && tab.id === 'workspace');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'paper-trading' && accountState.positions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-bold text-2xs">
                    {accountState.positions.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={onOpenAuditLog}
          className="hidden lg:flex items-center space-x-1.5 text-2xs text-slate-400 hover:text-cyan-400 transition font-mono px-2 py-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>EVIDENCE AUDIT</span>
        </button>
      </div>
    </header>
  );
};

