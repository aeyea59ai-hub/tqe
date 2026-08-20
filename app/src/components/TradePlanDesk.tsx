import React from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Layers3,
  Play,
  ShieldAlert,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { AccountState, DeterministicTradePlan, RiskEvaluation } from '../types';

interface TradePlanDeskProps {
  plan: DeterministicTradePlan | null;
  risk: RiskEvaluation | null;
  accountState: AccountState;
  onExecutePaperTrade: () => void;
  onCalculatePlan: () => void;
  isLoading: boolean;
}

function formatValue(value: number) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: value < 10 ? 4 : 2,
    maximumFractionDigits: value < 10 ? 6 : 2,
  });
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({
  label,
  value,
  tone = 'text-slate-300',
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-800/70 py-3 last:border-b-0">
    <span className="text-[9px] text-slate-600">{label}</span>
    <span className={`max-w-[190px] truncate text-right font-mono text-[10px] font-bold ${tone}`}>{value}</span>
  </div>
);

export const TradePlanDesk: React.FC<TradePlanDeskProps> = ({
  plan,
  risk,
  accountState,
  onExecutePaperTrade,
  onCalculatePlan,
  isLoading,
}) => {
  if (!plan || !risk) {
    return (
      <section className="grid min-h-[460px] place-items-center border border-slate-800/90 bg-[#0a0f19] p-8 text-center font-mono text-xs">
        <div className="max-w-md">
          <Target className="mx-auto h-8 w-8 text-slate-700" />
          <h2 className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-slate-200">No active trade plan</h2>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
            Select a scanner candidate or generate a plan from the current asset workspace. This page does not create market facts itself.
          </p>
          <button
            onClick={onCalculatePlan}
            disabled={isLoading}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-[10px] font-black text-cyan-200 hover:bg-cyan-500/15 disabled:opacity-50"
          >
            <Layers3 className="h-4 w-4" />
            {isLoading ? 'Calculating…' : 'Generate deterministic plan'}
          </button>
        </div>
      </section>
    );
  }

  const isLong = plan.direction === 'LONG';
  const minRRRequired = 1.5;
  const presentationMismatch = risk.status === 'PASS' && plan.effectiveRR < minRRRequired;
  const executionBlocked = risk.status === 'REJECT' || accountState.dailyLockout || presentationMismatch;

  const targets = [
    { label: 'TP1', value: plan.tp1, rr: '1.5R' },
    { label: 'TP2', value: plan.tp2, rr: '2.5R' },
    { label: 'TP3', value: plan.tp3, rr: '4.0R' },
  ];

  return (
    <div className="space-y-4 font-mono text-xs text-slate-100">
      <section className="flex flex-col gap-3 border border-amber-500/20 bg-amber-500/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">Paper confirmation boundary</div>
            <div className="mt-1 text-[9px] leading-relaxed text-slate-600">
              Review the existing deterministic values below. Execution remains simulated and is disabled whenever the current risk state rejects the plan.
            </div>
          </div>
        </div>
        <div
          className={`inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-[9px] font-black sm:self-auto ${
            executionBlocked
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {executionBlocked ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {presentationMismatch ? 'PRESENTATION MISMATCH' : `RISK ${risk.status}`}
        </div>
      </section>

      {presentationMismatch && (
        <section className="flex items-start gap-3 border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em]">Risk presentation mismatch</div>
            <div className="mt-1 text-[9px] text-amber-300/75">
              Effective R:R {plan.effectiveRR} is below the UI policy threshold {minRRRequired}. Paper action remains disabled.
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="h-fit border border-slate-800/90 bg-[#0a0f19]">
          <div className="border-b border-slate-800/90 px-4 py-3">
            <div className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-600">Decision context</div>
            <div className="mt-2 flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-md border ${
                  isLong
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                {isLong ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              </div>
              <div>
                <div className="font-mono text-xs font-black text-slate-100">{plan.symbol}</div>
                <div className={`mt-0.5 text-[9px] font-black ${isLong ? 'text-emerald-300' : 'text-rose-300'}`}>{plan.direction}</div>
              </div>
            </div>
          </div>
          <dl className="px-4">
            <DetailRow label="Plan ID" value={plan.id} />
            <DetailRow label="Snapshot" value={plan.snapshotId} />
            <DetailRow label="Calculated" value={new Date(plan.tradePlanCalculatedAt).toLocaleString()} />
            <DetailRow label="Paper equity" value={`$${accountState.equity.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
            <DetailRow label="Open positions" value={accountState.positions.length} />
          </dl>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="border border-slate-800/90 bg-[#0a0f19]">
            <div className="border-b border-slate-800/90 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Trade geometry</div>
              <div className="mt-0.5 text-[9px] text-slate-600">Entry, invalidation and target values from the existing plan service.</div>
            </div>
            <div className="grid sm:grid-cols-2">
              <div className="border-b border-r border-slate-800/70 p-4">
                <div className="text-[9px] uppercase tracking-[0.13em] text-slate-600">Entry zone</div>
                <div className="mt-2 font-mono text-sm font-black text-cyan-300">
                  {formatValue(plan.entryZone[0])} – {formatValue(plan.entryZone[1])}
                </div>
                <div className="mt-1 text-[9px] text-slate-600">Reference entry {formatValue(plan.entryPrice)}</div>
              </div>
              <div className="border-b border-slate-800/70 p-4">
                <div className="text-[9px] uppercase tracking-[0.13em] text-slate-600">Stop and invalidation</div>
                <div className="mt-2 font-mono text-sm font-black text-rose-300">{formatValue(plan.stopLoss)}</div>
                <div className="mt-1 text-[9px] text-slate-600">Invalidation {formatValue(plan.invalidationPrice)}</div>
              </div>
              <div className="border-r border-slate-800/70 p-4">
                <div className="text-[9px] uppercase tracking-[0.13em] text-slate-600">Reward / risk</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-mono text-sm font-black text-slate-200">Gross {plan.grossRR}</span>
                  <span className={`font-mono text-sm font-black ${plan.effectiveRR >= minRRRequired ? 'text-emerald-300' : 'text-amber-300'}`}>Net {plan.effectiveRR}</span>
                </div>
                <div className="mt-1 text-[9px] text-slate-600">After current fee, slippage and funding assumptions.</div>
              </div>
              <div className="p-4">
                <div className="text-[9px] uppercase tracking-[0.13em] text-slate-600">Position model</div>
                <div className="mt-2 font-mono text-sm font-black text-emerald-300">${risk.maxPositionSizeUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                <div className="mt-1 text-[9px] text-slate-600">{risk.contractQuantity} contracts · {risk.leverageUsed}x leverage</div>
              </div>
            </div>
          </section>

          <section className="border border-slate-800/90 bg-[#0a0f19]">
            <div className="border-b border-slate-800/90 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Targets</div>
              <div className="mt-0.5 text-[9px] text-slate-600">Existing target values are displayed without recalculation in the UI.</div>
            </div>
            <div className="grid sm:grid-cols-3">
              {targets.map((target, index) => (
                <div key={target.label} className="border-b border-r border-slate-800/70 p-4 last:border-r-0 sm:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500">{target.label}</span>
                    <span className="text-[9px] font-black text-emerald-400">{target.rr}</span>
                  </div>
                  <div className="mt-2 font-mono text-sm font-black text-emerald-300">{formatValue(target.value)}</div>
                  <div className="mt-1 text-[9px] text-slate-600">Target {index + 1}</div>
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={onExecutePaperTrade}
            disabled={executionBlocked}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[10px] font-black text-emerald-200 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-600"
          >
            <Play className="h-4 w-4" />
            {executionBlocked ? 'Paper action blocked by current state' : 'Confirm simulated paper action'}
          </button>
        </main>

        <aside className="h-fit space-y-4">
          <section className="border border-slate-800/90 bg-[#0a0f19]">
            <div className="border-b border-slate-800/90 px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Risk inspector
              </div>
            </div>
            <dl className="px-4">
              <DetailRow label="Verdict" value={risk.status} tone={risk.status === 'PASS' ? 'text-emerald-300' : 'text-rose-300'} />
              <DetailRow label="Risk amount" value={`$${risk.riskUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
              <DetailRow label="Leverage" value={`${risk.leverageUsed}x`} />
              <DetailRow label="Modeled liquidation" value={formatValue(risk.modeledLiquidationPrice)} />
              <DetailRow label="Safety buffer" value={`${risk.safetyBufferPct.toFixed(2)}%`} />
              <DetailRow label="Daily lock" value={risk.dailyLockActive ? 'ACTIVE' : 'CLEAR'} tone={risk.dailyLockActive ? 'text-rose-300' : 'text-emerald-300'} />
            </dl>
          </section>

          <section className="border border-slate-800/90 bg-[#0a0f19]">
            <div className="border-b border-slate-800/90 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Modeled costs</div>
            </div>
            <dl className="px-4">
              <DetailRow label="Taker fee" value={`${plan.estimatedTakerFeePct.toFixed(4)}%`} />
              <DetailRow label="Slippage" value={`${plan.estimatedSlippagePct.toFixed(4)}%`} />
              <DetailRow label="Funding cost" value={`${plan.estimatedFundingCostPct.toFixed(4)}%`} />
            </dl>
          </section>

          {(risk.rejections.length > 0 || risk.warnings.length > 0) && (
            <section className="border border-slate-800/90 bg-[#0a0f19]">
              <div className="border-b border-slate-800/90 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">Risk messages</div>
              </div>
              <div className="space-y-2 p-3">
                {risk.rejections.map((message) => (
                  <div key={`reject-${message}`} className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/[0.06] p-2.5 text-[9px] text-rose-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {message}
                  </div>
                ))}
                {risk.warnings.map((message) => (
                  <div key={`warning-${message}`} className="flex items-start gap-2 border border-amber-500/20 bg-amber-500/[0.06] p-2.5 text-[9px] text-amber-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {message}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="border border-slate-800/90 bg-[#0a0f19] p-4">
            <div className="flex items-start gap-3">
              <CircleDollarSign className="mt-0.5 h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-[10px] font-black text-slate-200">Simulation only</div>
                <div className="mt-1 text-[9px] leading-relaxed text-slate-600">
                  This UI sends no real exchange order and does not introduce a live-trading control.
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
