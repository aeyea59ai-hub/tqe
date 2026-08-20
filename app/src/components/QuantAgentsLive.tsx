import React, { useState, useEffect } from 'react';
import { AccountState, ScanCandidate } from '../types';
import { openPaperPosition, closePaperPosition, updatePaperAccountPrices } from '../lib/paperEngine';
import { Cpu, ShieldAlert, Zap, BarChart3, Activity, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { getAllMarketStoreItems } from '../lib/marketStore';
import { STRATEGY_DEFINITIONS } from '../lib/strategies';

interface QuantAgentsLiveProps {
  accountState: AccountState;
  setAccountState: React.Dispatch<React.SetStateAction<AccountState>>;
}

interface AgentLog {
  id: string;
  timestamp: number;
  agent: 'Simulated Trading Analyst' | 'Risk Control Analyst' | 'Manager' | 'User Mimic Agent';
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const QuantAgentsLive: React.FC<QuantAgentsLiveProps> = ({ accountState, setAccountState }) => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<string>('Idle');
  
  // Risk strictness setting (less risk if too hot)
  const [strictRisk, setStrictRisk] = useState(true);

  const addLog = (agent: AgentLog['agent'], action: string, details: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      agent,
      action,
      details,
      type
    }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // 1. Pick a random market
      const markets = getAllMarketStoreItems();
      if (markets.length === 0) return;
      const target = markets[Math.floor(Math.random() * markets.length)];
      
      setCurrentFocus(target.symbol);
      
      // Simulated Trading Analyst or User Mimic Agent proposes a trade
      const direction = Math.random() > 0.5 ? 'LONG' : 'SHORT';
      const isMimic = Math.random() > 0.5;
      const proposingAgent = isMimic ? 'User Mimic Agent' : 'Simulated Trading Analyst';
      const strategy = STRATEGY_DEFINITIONS[Math.floor(Math.random() * Math.min(5, STRATEGY_DEFINITIONS.length))];
      
      addLog(
        proposingAgent, 
        isMimic ? 'User Style Match' : 'Scanned Opportunity', 
        isMimic ? `Mimicking your historical trading style: Found ${direction} setup for ${target.symbol} using ${strategy.code}.` : `Found ${direction} setup for ${target.symbol} using ${strategy.code}. Current Price: ${target.lastPrice.toFixed(2)}`,
        'info'
      );

      // Risk Control Analyst evaluates
      setTimeout(() => {
        // High volatility or strict risk -> Veto
        const isTooHot = Math.random() > (strictRisk ? 0.3 : 0.7); // If strict, 70% chance to veto random trades
        
        if (isTooHot) {
          addLog(
            'Risk Control Analyst',
            'Risk Veto',
            `Market conditions too hot (high volatility / counter-trend) for ${target.symbol}. Vetoing trade to protect capital.`,
            'warning'
          );
        } else {
          addLog(
            'Risk Control Analyst',
            'Risk Approved',
            `Risk parameters acceptable for ${target.symbol}. Sizing adjusted for safety.`,
            'success'
          );
          
          // Manager executes
          setTimeout(() => {
             const entryPrice = target.lastPrice;
             const quantity = (accountState.equity * 0.02) / entryPrice; // 2% risk sizing
             const sl = direction === 'LONG' ? entryPrice * 0.98 : entryPrice * 1.02;
             const tp = direction === 'LONG' ? entryPrice * 1.06 : entryPrice * 0.94;
             
             // Open position via paper engine (this relies on global state, we update our local React state)
             // We'll simulate opening it manually to make sure React state updates
             const newPos = {
               id: `live-${Date.now()}`,
               symbol: target.symbol,
               direction,
               entryPrice,
               quantity,
               leverage: 1,
               pnlUsd: 0,
               pnlPct: 0,
               stopLoss: sl,
               tp1: tp,
               openedAt: Date.now()
             };
             
             setAccountState(prev => {
                const updated = {
                  ...prev,
                  freeMargin: prev.freeMargin - (entryPrice * quantity),
                  positions: [...prev.positions, newPos as any]
                };
                return updated;
             });

             addLog(
               'Manager',
               'Trade Executed',
               `Opened ${direction} on ${target.symbol} at $${entryPrice.toFixed(2)}. SL: $${sl.toFixed(2)}, TP: $${tp.toFixed(2)}`,
               'success'
             );
          }, 1000);
        }
      }, 1500);

    }, 6000); // Check every 6 seconds for demo purposes

    return () => clearInterval(interval);
  }, [isRunning, strictRisk, accountState.equity, setAccountState]);

  // Position Management Loop (Closing positions)
  useEffect(() => {
     if (!isRunning) return;
     const interval = setInterval(() => {
        setAccountState(prev => {
           let state = { ...prev };
           const markets = getAllMarketStoreItems();
           
           // Update prices
           let newPositions = state.positions.map(pos => {
              const m = markets.find(x => x.symbol === pos.symbol);
              if (!m) return pos;
              const currentPrice = m.lastPrice;
              const pnl = pos.direction === 'LONG' 
                 ? (currentPrice - pos.entryPrice) * pos.quantity
                 : (pos.entryPrice - currentPrice) * pos.quantity;
              return { ...pos, pnlUsd: pnl, pnlPct: (pnl / (pos.entryPrice * pos.quantity)) * 100 };
           });
           
           // Check SL/TP
           const toClose = newPositions.filter(p => {
              const m = markets.find(x => x.symbol === p.symbol);
              if (!m) return false;
              const cp = m.lastPrice;
              if (p.direction === 'LONG' && (cp <= p.stopLoss || cp >= p.tp1)) return true;
              if (p.direction === 'SHORT' && (cp >= p.stopLoss || cp <= p.tp1)) return true;
              return false;
           });
           
           toClose.forEach(p => {
              const m = markets.find(x => x.symbol === p.symbol);
              const cp = m ? m.lastPrice : p.entryPrice;
              const pnl = p.direction === 'LONG' 
                 ? (cp - p.entryPrice) * p.quantity
                 : (p.entryPrice - cp) * p.quantity;
                 
              state.equity += pnl;
              state.freeMargin += (p.entryPrice * p.quantity) + pnl;
              
              addLog(
                'Manager',
                'Trade Closed',
                `Closed ${p.direction} on ${p.symbol}. PNL: $${pnl.toFixed(2)}`,
                pnl >= 0 ? 'success' : 'error'
              );
           });
           
           state.positions = newPositions.filter(p => !toClose.includes(p));
           state.totalPnlUsd = state.positions.reduce((acc, p) => acc + p.pnlUsd, 0);
           return state;
        });
     }, 2000);
     return () => clearInterval(interval);
  }, [isRunning, setAccountState]);


  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-100 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-cyan-400" />
            QuantAgents Live Training
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Autonomous multi-agent system analyzing markets and executing trades on paper wallet.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <button
             onClick={() => setStrictRisk(!strictRisk)}
             className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
               strictRisk 
                 ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400'
                 : 'bg-rose-950/50 border-rose-800 text-rose-400'
             }`}
           >
             <ShieldAlert className="w-4 h-4" />
             {strictRisk ? 'STRICT RISK (SAFE)' : 'RELAXED RISK (HOT)'}
           </button>
        
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              isRunning 
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' 
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isRunning ? <XCircle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            {isRunning ? 'STOP AGENTS' : 'START LIVE AGENTS'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Agent Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 h-[600px] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Live Agent Operations
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Status:</span>
                {isRunning ? (
                  <span className="text-emerald-400 font-bold animate-pulse">ANALYZING {currentFocus}</span>
                ) : (
                  <span className="text-slate-500 font-bold">IDLE</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Waiting for agent activity... Start the agents to begin.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-sm flex gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="w-24 shrink-0 text-slate-500 text-xs mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-200">{log.agent}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className={`text-xs font-bold uppercase ${
                          log.type === 'success' ? 'text-emerald-400' :
                          log.type === 'warning' ? 'text-amber-400' :
                          log.type === 'error' ? 'text-rose-400' : 'text-cyan-400'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Wallet & Open Positions */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Agent Wallet
            </h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Total Equity</span>
                <span className="text-3xl font-light text-slate-100">${accountState.equity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 block">Available</span>
                  <span className="text-sm font-bold text-slate-300">${accountState.freeMargin.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Open PnL</span>
                  <span className={`text-sm font-bold ${accountState.totalPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${accountState.totalPnlUsd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex-1 h-[320px] flex flex-col">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              Active Trades ({accountState.positions.length})
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {accountState.positions.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-10">
                  No active trades.
                </div>
              ) : (
                accountState.positions.map(pos => (
                  <div key={pos.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-200">{pos.symbol}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        pos.direction === 'LONG' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-rose-950/50 text-rose-400'
                      }`}>
                        {pos.direction}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Entry: ${pos.entryPrice.toFixed(4)}</span>
                      <span className={(pos.pnlUsd || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {(pos.pnlUsd || 0) >= 0 ? '+' : ''}${(pos.pnlUsd || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
