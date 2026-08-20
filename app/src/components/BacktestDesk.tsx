// Multi-Year Historical Backtesting & Replay Desk for SIGNAL DESK UNIFIED v2.0
import React, { useState, useEffect } from 'react';
import { CanonicalSnapshot, SymbolInfo } from '../types';
import { BacktestReport, BacktestTrade } from '../lib/backtestEngine';
import { ReplayDesk } from './ReplayDesk';
import {
  Play,
  RotateCcw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Calendar,
  DollarSign,
  Activity,
  Layers,
  Award,
  Filter,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react';

interface BacktestDeskProps {
  symbols: SymbolInfo[];
  currentSnapshot: CanonicalSnapshot;
}

export const BacktestDesk: React.FC<BacktestDeskProps> = ({ symbols, currentSnapshot }) => {
  const [activeSubTab, setActiveSubTab] = useState<'backtest' | 'replay'>('backtest');

  // Parameters
  const [selectedSymbol, setSelectedSymbol] = useState(currentSnapshot.symbol || 'BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2026-08-10');
  const [initialBalance, setInitialBalance] = useState(10000);
  const [riskPerTradePct, setRiskPerTradePct] = useState(1.0);
  const [maxLeverage, setMaxLeverage] = useState(10);

  // Results
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          timeframe,
          startDate,
          endDate,
          initialBalance,
          riskPerTradePct,
          maxLeverage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to run backtest:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBacktest();
  }, []);

  const filteredTrades = report
    ? report.trades.filter((t) => {
        if (tradeFilter === 'WIN') return t.netPnlUsd > 0;
        if (tradeFilter === 'LOSS') return t.netPnlUsd <= 0;
        return true;
      })
    : [];

  return (
    <div className="space-y-6 text-slate-100 font-mono text-xs">
      {/* Sub tab navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('backtest')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
              activeSubTab === 'backtest'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>HISTORICAL BACKTEST (2023 - PRESENT)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('replay')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
              activeSubTab === 'replay'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>BAR-BY-BAR REPLAY</span>
          </button>
        </div>

        <div className="text-2xs text-slate-400">
          DETERMINISTIC SIMULATION • ZERO AI OVERRIDE ON RISKS
        </div>
      </div>

      {activeSubTab === 'replay' ? (
        <ReplayDesk snapshot={currentSnapshot} />
      ) : (
        <div className="space-y-6">
          {/* Backtest Config Controls Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold tracking-wider uppercase">
                  BACKTEST SIMULATION CONFIGURATION
                </h3>
              </div>
              <span className="text-2xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
                CANONICAL VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-2xs text-slate-400 block mb-1">SYMBOL</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
                >
                  {symbols.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-2xs text-slate-400 block mb-1">TIMEFRAME</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
                >
                  <option value="15m">15m (Scalp)</option>
                  <option value="1h">1h (Intraday)</option>
                  <option value="4h">4h (Swing)</option>
                  <option value="1d">1d (Macro)</option>
                </select>
              </div>

              <div>
                <label className="text-2xs text-slate-400 block mb-1">START DATE</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-2xs text-slate-400 block mb-1">END DATE</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-2xs text-slate-400 block mb-1">INITIAL CAPITAL ($)</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 10000)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-2xs text-slate-400 block mb-1">RISK % / TRADE</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPerTradePct}
                  onChange={(e) => setRiskPerTradePct(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={runBacktest}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'RUNNING HISTORICAL BACKTEST...' : 'EXECUTE MULTI-YEAR BACKTEST'}</span>
              </button>
            </div>
          </div>

          {/* Results Display */}
          {report && (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">NET PROFIT</span>
                  <span
                    className={`text-base font-extrabold block mt-0.5 ${
                      report.netProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ${report.netProfitUsd.toLocaleString()}
                  </span>
                  <span className="text-3xs text-slate-500">
                    {report.totalReturnPct >= 0 ? '+' : ''}
                    {report.totalReturnPct}% Return
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">FINAL EQUITY</span>
                  <span className="text-base font-extrabold text-slate-100 block mt-0.5">
                    ${report.finalEquity.toLocaleString()}
                  </span>
                  <span className="text-3xs text-slate-500">
                    Init: ${report.initialBalance.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">WIN RATE</span>
                  <span className="text-base font-extrabold text-cyan-400 block mt-0.5">
                    {report.winRatePct}%
                  </span>
                  <span className="text-3xs text-slate-500">
                    {report.winningTrades}W / {report.losingTrades}L ({report.totalTrades} Total)
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">PROFIT FACTOR</span>
                  <span className="text-base font-extrabold text-amber-400 block mt-0.5">
                    {report.profitFactor}
                  </span>
                  <span className="text-3xs text-slate-500">Gross Wins / Gross Losses</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">MAX DRAWDOWN</span>
                  <span className="text-base font-extrabold text-rose-400 block mt-0.5">
                    -{report.maxDrawdownPct}%
                  </span>
                  <span className="text-3xs text-slate-500">
                    -${report.maxDrawdownUsd.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">AVG TRADE PNL</span>
                  <span
                    className={`text-base font-extrabold block mt-0.5 ${
                      report.avgTradePnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ${report.avgTradePnlUsd}
                  </span>
                  <span className="text-3xs text-slate-500">Per Executed Trade</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">SHARPE RATIO</span>
                  <span className="text-base font-extrabold text-purple-400 block mt-0.5">
                    {report.sharpeRatio}
                  </span>
                  <span className="text-3xs text-slate-500">Annualized Standardized</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-2xs text-slate-400 block uppercase">TOTAL FEES</span>
                  <span className="text-base font-extrabold text-slate-300 block mt-0.5">
                    ${report.totalFeesUsd}
                  </span>
                  <span className="text-3xs text-slate-500">Exchange Taker Fees</span>
                </div>
              </div>

              {/* Equity Curve Visualizer */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      EQUITY CURVE & DRAWDOWN OVER TIME ({report.startDate} → {report.endDate})
                    </h4>
                  </div>
                  <span className="text-2xs text-slate-400">
                    {report.equityCurve.length} DATA POINTS
                  </span>
                </div>

                {/* SVG Equity Chart */}
                <div className="h-48 w-full bg-slate-900/60 rounded-lg p-2 relative overflow-hidden border border-slate-800 flex items-end">
                  {report.equityCurve.length > 1 && (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="1000" y2="50" stroke="#1e293b" strokeDasharray="4" />
                      <line x1="0" y1="100" x2="1000" y2="100" stroke="#1e293b" strokeDasharray="4" />
                      <line x1="0" y1="150" x2="1000" y2="150" stroke="#1e293b" strokeDasharray="4" />

                      {/* Equity Line */}
                      {(() => {
                        const minEq = Math.min(...report.equityCurve.map((e) => e.equity)) * 0.95;
                        const maxEq = Math.max(...report.equityCurve.map((e) => e.equity)) * 1.05;
                        const range = maxEq - minEq || 1;

                        const points = report.equityCurve
                          .map((pt, idx) => {
                            const x = (idx / (report.equityCurve.length - 1)) * 1000;
                            const y = 200 - ((pt.equity - minEq) / range) * 180;
                            return `${x},${y}`;
                          })
                          .join(' ');

                        return (
                          <polyline
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="2.5"
                            points={points}
                          />
                        );
                      })()}
                    </svg>
                  )}
                </div>
              </div>

              {/* Monthly Returns Heatmap */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  MONTHLY PERFORMANCE BREAKDOWN (PNL %)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-2xs">
                  {report.monthlyHeatmap.map((m) => (
                    <div
                      key={`${m.year}-${m.month}`}
                      className={`p-2.5 rounded-lg border text-center flex flex-col justify-between ${
                        m.pnlUsd >= 0
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      }`}
                    >
                      <span className="text-3xs text-slate-400 block font-bold">
                        {m.year}-{m.month.toString().padStart(2, '0')}
                      </span>
                      <span className="text-sm font-black my-1 block">
                        {m.pnlPct >= 0 ? '+' : ''}
                        {m.pnlPct}%
                      </span>
                      <span className="text-3xs opacity-80">
                        {m.tradesCount} Trades ({m.winRatePct}% W)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executed Trades Log */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      EXECUTED BACKTEST TRADES LOG ({report.trades.length} TRADES)
                    </h4>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTradeFilter('ALL')}
                      className={`px-3 py-1 rounded text-2xs font-bold transition ${
                        tradeFilter === 'ALL'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      ALL ({report.trades.length})
                    </button>
                    <button
                      onClick={() => setTradeFilter('WIN')}
                      className={`px-3 py-1 rounded text-2xs font-bold transition ${
                        tradeFilter === 'WIN'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      WINS ({report.winningTrades})
                    </button>
                    <button
                      onClick={() => setTradeFilter('LOSS')}
                      className={`px-3 py-1 rounded text-2xs font-bold transition ${
                        tradeFilter === 'LOSS'
                          ? 'bg-rose-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      LOSSES ({report.losingTrades})
                    </button>
                  </div>
                </div>

                {/* Trades Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-2xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="py-2.5 px-3">DATE / TIME</th>
                        <th className="py-2.5 px-3">SIDE</th>
                        <th className="py-2.5 px-3">STRATEGY</th>
                        <th className="py-2.5 px-3">ENTRY</th>
                        <th className="py-2.5 px-3">EXIT</th>
                        <th className="py-2.5 px-3">STOP LOSS</th>
                        <th className="py-2.5 px-3">TP3</th>
                        <th className="py-2.5 px-3">NET PNL ($)</th>
                        <th className="py-2.5 px-3">ROE %</th>
                        <th className="py-2.5 px-3">EXIT REASON</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredTrades.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-900/60 transition">
                          <td className="py-2 px-3 text-slate-300 font-bold">
                            {new Date(t.entryTimestamp).toLocaleString()}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-extrabold ${
                                t.direction === 'LONG'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                              }`}
                            >
                              {t.direction}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-cyan-400">
                            {t.strategyCode} - {t.strategyName}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-200">
                            ${t.entryPrice.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-200">
                            ${t.exitPrice.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-rose-400">${t.stopLoss.toLocaleString()}</td>
                          <td className="py-2 px-3 text-emerald-400">${t.tp3.toLocaleString()}</td>
                          <td
                            className={`py-2 px-3 font-extrabold ${
                              t.netPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {t.netPnlUsd >= 0 ? '+' : ''}${t.netPnlUsd}
                          </td>
                          <td
                            className={`py-2 px-3 font-bold ${
                              t.roePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {t.roePct >= 0 ? '+' : ''}
                            {t.roePct}%
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-3xs font-bold uppercase ${
                                t.exitReason.startsWith('TP')
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : t.exitReason === 'SL_HIT'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {t.exitReason}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
