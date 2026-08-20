import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock3,
  History,
  ListOrdered,
  RefreshCw,
  ShieldAlert,
  Target,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { AccountState, PaperPosition } from '../types';

interface PaperTradingDeskProps {
  accountState: AccountState;
  onClosePosition: (positionId: string) => void;
  onResetAccount: () => void;
}

type PaperView = 'overview' | 'positions' | 'history' | 'journal';

const money = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const price = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

function pnlTone(value: number) {
  if (value > 0) return 'text-emerald-300';
  if (value < 0) return 'text-rose-300';
  return 'text-slate-300';
}

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  hint: string;
  tone?: string;
}> = ({ label, value, hint, tone = 'text-slate-100' }) => (
  <div className="min-w-0 border-r border-slate-800/80 px-3 py-3 last:border-r-0">
    <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">{label}</div>
    <div className={`mt-1 truncate font-mono text-base font-black ${tone}`}>{value}</div>
    <div className="mt-0.5 truncate text-[9px] text-slate-600">{hint}</div>
  </div>
);

const PositionDirection: React.FC<{ position: PaperPosition }> = ({ position }) => {
  const isLong = position.direction === 'LONG';
  return (
    <div
      className={`grid h-8 w-8 place-items-center rounded-md border ${
        isLong
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
      }`}
      aria-label={position.direction}
    >
      {isLong ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
    </div>
  );
};

export const PaperTradingDesk: React.FC<PaperTradingDeskProps> = ({
  accountState,
  onClosePosition,
  onResetAccount,
}) => {
  const [view, setView] = React.useState<PaperView>('overview');
  const openPositions = accountState.positions || [];
  const closedPositions = accountState.closedPositions || [];

  const views: Array<{ id: PaperView; label: string; description: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'Overview', description: 'Equity, exposure and risk state', icon: WalletCards },
    { id: 'positions', label: 'Open Positions', description: `${openPositions.length} active simulated positions`, icon: Target },
    { id: 'history', label: 'Order History', description: `${closedPositions.length} closed paper outcomes`, icon: History },
    { id: 'journal', label: 'Journal', description: 'Chronological paper activity', icon: BookOpen },
  ];

  const renderPositionRow = (position: PaperPosition, compact = false) => (
    <div
      key={position.id}
      className={`grid items-center gap-3 border-b border-slate-800/70 px-3 last:border-b-0 ${
        compact
          ? 'grid-cols-[36px_minmax(0,1fr)_auto] py-3'
          : 'grid-cols-[36px_minmax(140px,1fr)_repeat(4,minmax(92px,.72fr))_auto] py-3'
      }`}
    >
      <PositionDirection position={position} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-slate-100">{position.symbol}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-black ${
              position.direction === 'LONG'
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-rose-500/10 text-rose-300'
            }`}
          >
            {position.direction}
          </span>
        </div>
        <div className="mt-0.5 truncate text-[9px] text-slate-600">
          Opened {new Date(position.openedAt).toLocaleString()}
        </div>
      </div>

      {compact ? (
        <div className="text-right">
          <div className={`font-mono text-xs font-black ${pnlTone(position.pnlUsd)}`}>
            {position.pnlUsd >= 0 ? '+' : ''}${money(position.pnlUsd)}
          </div>
          <button
            onClick={() => setView('positions')}
            className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 hover:text-cyan-300"
          >
            Manage <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-600">Entry / Mark</div>
            <div className="mt-1 font-mono text-[10px] font-bold text-slate-300">
              {price(position.entryPrice)} / {price(position.currentPrice)}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-600">Quantity</div>
            <div className="mt-1 font-mono text-[10px] font-bold text-slate-300">{position.quantity}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-600">Risk limits</div>
            <div className="mt-1 font-mono text-[10px] font-bold text-slate-300">
              SL {price(position.stopLoss)}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-600">PnL / ROE</div>
            <div className={`mt-1 font-mono text-[10px] font-black ${pnlTone(position.pnlUsd)}`}>
              {position.pnlUsd >= 0 ? '+' : ''}${money(position.pnlUsd)} · {position.roePct.toFixed(2)}%
            </div>
          </div>
          <button
            onClick={() => onClosePosition(position.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-[9px] font-black text-rose-300 hover:bg-rose-500/15"
          >
            <XCircle className="h-3.5 w-3.5" /> Close
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4 font-mono text-xs text-slate-100">
      <section className="flex flex-col gap-3 border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">Paper-only workspace</div>
            <div className="mt-1 max-w-3xl text-[10px] leading-relaxed text-slate-500">
              Simulated account activity only. This section is intentionally separated from the market overview and does not expose live-order controls.
            </div>
          </div>
        </div>
        <button
          onClick={onResetAccount}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-[10px] font-bold text-slate-400 hover:border-slate-700 hover:text-slate-100"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reset paper account
        </button>
      </section>

      <div className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="h-fit border border-slate-800/90 bg-[#0a0f19]">
          <div className="border-b border-slate-800/90 px-4 py-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">Paper Trading</div>
            <div className="mt-1 text-xs font-black text-slate-100">Simulation workspace</div>
          </div>
          <nav className="p-2" aria-label="Paper trading sections">
            {views.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`mb-1 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left last:mb-0 ${
                    active
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
                      : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/70 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-600'}`} />
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black">{item.label}</span>
                    <span className="mt-0.5 block text-[9px] leading-snug text-slate-600">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="grid grid-cols-2 border border-slate-800/90 bg-[#0a0f19] sm:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Balance" value={`$${money(accountState.balance)}`} hint="Settled paper cash" />
            <MetricCard
              label="Equity"
              value={`$${money(accountState.equity)}`}
              hint="Balance plus open PnL"
              tone={accountState.equity >= accountState.balance ? 'text-emerald-300' : 'text-rose-300'}
            />
            <MetricCard
              label="Total PnL"
              value={`${accountState.totalPnlUsd >= 0 ? '+' : ''}$${money(accountState.totalPnlUsd)}`}
              hint="Realized and unrealized"
              tone={pnlTone(accountState.totalPnlUsd)}
            />
            <MetricCard label="Win rate" value={`${accountState.winRatePct}%`} hint={`${accountState.winCount}/${accountState.totalTrades} closed`} tone="text-cyan-300" />
            <MetricCard label="Profit factor" value={accountState.profitFactor} hint="Closed outcomes only" />
            <MetricCard
              label="Daily drawdown"
              value={`${accountState.dailyDrawdownPct.toFixed(2)}%`}
              hint={accountState.dailyLockout ? 'Risk lock active' : 'Simulation account'}
              tone={accountState.dailyLockout ? 'text-rose-300' : 'text-slate-100'}
            />
          </section>

          {accountState.dailyLockout && (
            <section className="flex items-start gap-3 border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em]">Paper risk lock active</div>
                <div className="mt-1 text-[10px] text-rose-300/80">{accountState.lockoutReason || 'New paper positions are restricted by the current simulation risk state.'}</div>
              </div>
            </section>
          )}

          {view === 'overview' && (
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
              <section className="border border-slate-800/90 bg-[#0a0f19]">
                <div className="flex items-center justify-between border-b border-slate-800/90 px-4 py-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Open position snapshot</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">Compact overview only — management lives in Open Positions.</div>
                  </div>
                  <button onClick={() => setView('positions')} className="text-[9px] font-black text-cyan-400 hover:text-cyan-300">
                    View all
                  </button>
                </div>
                {openPositions.length ? (
                  <div>{openPositions.slice(0, 5).map((position) => renderPositionRow(position, true))}</div>
                ) : (
                  <div className="grid min-h-48 place-items-center px-6 text-center">
                    <div>
                      <Activity className="mx-auto h-6 w-6 text-slate-700" />
                      <div className="mt-3 text-xs font-black text-slate-300">No open paper positions</div>
                      <div className="mt-1 text-[10px] text-slate-600">Open a fully reviewed decision from the Trade Plan workspace.</div>
                    </div>
                  </div>
                )}
              </section>

              <div className="space-y-4">
                <section className="border border-slate-800/90 bg-[#0a0f19]">
                  <div className="border-b border-slate-800/90 px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">
                    Account state
                  </div>
                  <dl className="divide-y divide-slate-800/70 px-4">
                    {[
                      ['Margin used', `$${money(accountState.marginUsed)}`],
                      ['Free margin', `$${money(accountState.freeMargin)}`],
                      ['Consecutive losses', String(accountState.consecutiveLosses)],
                      ['Max drawdown', `${accountState.maxDrawdownPct.toFixed(2)}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-3">
                        <dt className="text-[10px] text-slate-600">{label}</dt>
                        <dd className="font-mono text-[10px] font-bold text-slate-300">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="border border-slate-800/90 bg-[#0a0f19] p-4">
                  <div className="flex items-start gap-3">
                    <ListOrdered className="mt-0.5 h-4 w-4 text-cyan-400" />
                    <div>
                      <div className="text-[10px] font-black text-slate-200">Paper workflow</div>
                      <div className="mt-2 space-y-1.5 text-[9px] text-slate-600">
                        <div>1. Inspect deterministic candidate</div>
                        <div>2. Review evidence and risk</div>
                        <div>3. Confirm paper-only action</div>
                        <div>4. Track outcome in the journal</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {view === 'positions' && (
            <section className="overflow-x-auto border border-slate-800/90 bg-[#0a0f19]">
              <div className="min-w-[860px]">
                <div className="border-b border-slate-800/90 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Open positions</div>
                  <div className="mt-0.5 text-[9px] text-slate-600">Manage current simulated exposure separately from the Dashboard.</div>
                </div>
                {openPositions.length ? (
                  openPositions.map((position) => renderPositionRow(position))
                ) : (
                  <div className="grid min-h-56 place-items-center text-center">
                    <div>
                      <Target className="mx-auto h-7 w-7 text-slate-700" />
                      <div className="mt-3 text-xs font-black text-slate-300">No active positions</div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {view === 'history' && (
            <section className="overflow-x-auto border border-slate-800/90 bg-[#0a0f19]">
              <div className="min-w-[780px]">
                <div className="grid grid-cols-[minmax(160px,1fr)_110px_120px_120px_140px] border-b border-slate-800 bg-slate-950 px-4 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-600">
                  <span>Position</span><span>Status</span><span>Entry</span><span>Close</span><span className="text-right">Outcome</span>
                </div>
                {closedPositions.length ? (
                  closedPositions
                    .slice()
                    .reverse()
                    .map((position) => (
                      <div key={position.id} className="grid grid-cols-[minmax(160px,1fr)_110px_120px_120px_140px] items-center border-b border-slate-800/70 px-4 py-3 last:border-b-0">
                        <div>
                          <div className="font-mono text-[10px] font-black text-slate-200">{position.symbol} · {position.direction}</div>
                          <div className="mt-0.5 text-[9px] text-slate-600">{position.closeReason || position.status}</div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">{position.status}</span>
                        <span className="font-mono text-[10px] text-slate-400">{price(position.entryPrice)}</span>
                        <span className="font-mono text-[10px] text-slate-400">{position.closePrice ? price(position.closePrice) : '—'}</span>
                        <span className={`text-right font-mono text-[10px] font-black ${pnlTone(position.pnlUsd)}`}>
                          {position.pnlUsd >= 0 ? '+' : ''}${money(position.pnlUsd)}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="grid min-h-56 place-items-center text-center text-slate-600">No closed paper outcomes.</div>
                )}
              </div>
            </section>
          )}

          {view === 'journal' && (
            <section className="border border-slate-800/90 bg-[#0a0f19]">
              <div className="border-b border-slate-800/90 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Paper journal</div>
                <div className="mt-0.5 text-[9px] text-slate-600">Chronological outcome view derived from the current paper-account state.</div>
              </div>
              <div className="divide-y divide-slate-800/70">
                {closedPositions.length ? (
                  closedPositions
                    .slice()
                    .reverse()
                    .map((position) => (
                      <article key={position.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[32px_minmax(0,1fr)_auto]">
                        <div className={`grid h-8 w-8 place-items-center rounded-md border ${position.pnlUsd >= 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
                          {position.pnlUsd >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] font-black text-slate-200">{position.symbol}</span>
                            <span className="text-[9px] font-bold text-slate-500">{position.direction}</span>
                            <span className="text-[9px] text-slate-700">·</span>
                            <span className="text-[9px] text-slate-500">{position.closeReason || position.status}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-600">
                            <Clock3 className="h-3 w-3" />
                            {position.closedAt ? new Date(position.closedAt).toLocaleString() : 'Close time unavailable'}
                          </div>
                        </div>
                        <div className={`font-mono text-xs font-black ${pnlTone(position.pnlUsd)}`}>
                          {position.pnlUsd >= 0 ? '+' : ''}${money(position.pnlUsd)}
                        </div>
                      </article>
                    ))
                ) : (
                  <div className="grid min-h-56 place-items-center px-6 text-center">
                    <div>
                      <BookOpen className="mx-auto h-7 w-7 text-slate-700" />
                      <div className="mt-3 text-xs font-black text-slate-300">The paper journal is empty</div>
                      <div className="mt-1 text-[10px] text-slate-600">Closed simulated positions will appear here automatically.</div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

const TrendingUpIcon = () => <ArrowUpRight className="h-4 w-4" />;
const TrendingDownIcon = () => <ArrowDownRight className="h-4 w-4" />;
