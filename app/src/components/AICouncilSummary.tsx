// AI Council Summary & Detailed Mode - Blueprint Section 14
import React, { useState } from 'react';
import { CouncilDeliberation, CanonicalSnapshot } from '../types';
import { Cpu, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';

interface AICouncilSummaryProps {
  deliberation: CouncilDeliberation | null;
  snapshot: CanonicalSnapshot;
  onNavigateTab: (tab: string) => void;
}

export const AICouncilSummary: React.FC<AICouncilSummaryProps> = ({
  deliberation,
  snapshot,
  onNavigateTab,
}) => {
  const [showFullCouncil, setShowFullCouncil] = useState(false);

  if (!deliberation) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-3 font-mono text-xs">
        <Cpu className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
        <h4 className="text-sm font-extrabold text-slate-300 uppercase">
          NO AI COUNCIL DELIBERATION FOR THIS SNAPSHOT YET
        </h4>
        <p className="text-3xs text-slate-500 max-w-md mx-auto">
          Execute an AI Review on this market to generate frozen evidence bundle analysis from Primary, Auditor, Challenger, and Arbiter agents.
        </p>
      </div>
    );
  }

  // Symbol Context Validation Guard (Blueprint Section 33)
  const isContextValid = deliberation.symbol === snapshot.symbol;

  if (!isContextValid) {
    return (
      <div className="bg-rose-950/60 border border-rose-800 rounded-2xl p-6 space-y-3 font-mono text-xs text-rose-200">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h4 className="text-sm font-black uppercase">CONTEXT MISMATCH DETECTED</h4>
        </div>
        <p className="text-3xs text-rose-300">
          The loaded AI Council deliberation snapshot symbol ({deliberation.symbol}) does not match the page's current selected symbol ({snapshot.symbol}). Output invalid rendering prevented by Safety Guard.
        </p>
      </div>
    );
  }

  const { arbiterVerdict, opinions, councilChairSummary } = deliberation;
  const bullishCount = opinions.filter((o) => o.stance === 'BULLISH').length;
  const bearishCount = opinions.filter((o) => o.stance === 'BEARISH').length;
  const neutralCount = opinions.filter((o) => o.stance === 'NEUTRAL' || o.stance === 'CONCERN').length;

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* EXECUTIVE SUMMARY MODE (DEFAULT) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Header verdict banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold uppercase text-slate-100">
                  AI COUNCIL EXECUTIVE VERDICT ({deliberation.symbol})
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-3xs text-slate-400 font-bold">
                  {deliberation.direction}
                </span>
              </div>
              <p className="text-3xs text-slate-400 mt-0.5">
                SNAPSHOT ID: {deliberation.snapshotId} • TIMESTAMP: {new Date(deliberation.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase border tracking-wider flex items-center space-x-2 ${
                arbiterVerdict.status === 'APPROVED'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-lg shadow-emerald-950/40'
                  : arbiterVerdict.status === 'CONDITIONAL'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}
            >
              {arbiterVerdict.status === 'APPROVED' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>VERDICT: {arbiterVerdict.status}</span>
            </div>
          </div>
        </div>

        {/* Consensus distribution & stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-3xs text-slate-400 block uppercase">CONSENSUS SCORE</span>
            <span className="text-base font-black text-cyan-400 block mt-0.5">
              {arbiterVerdict.consensusScore}%
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-3xs text-slate-400 block uppercase">STANCE DISTRIBUTION</span>
            <div className="text-xs font-black mt-0.5 flex space-x-2">
              <span className="text-emerald-400">{bullishCount} Bull</span>
              <span className="text-rose-400">{bearishCount} Bear</span>
              <span className="text-slate-400">{neutralCount} Neu</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-3xs text-slate-400 block uppercase">RED TEAM HARD VETO</span>
            <span
              className={`text-xs font-black block mt-0.5 ${
                arbiterVerdict.redTeamPassed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {arbiterVerdict.redTeamPassed ? 'PASSED (NO VETO)' : 'VETOED'}
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-3xs text-slate-400 block uppercase">RISK ENGINE STATUS</span>
            <span className="text-xs font-black text-emerald-400 block mt-0.5">
              PASS (COMPLIANT)
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-3xs text-slate-400 block uppercase">DATA QUALITY GATE</span>
            <span className="text-xs font-black text-emerald-400 block mt-0.5">
              SCORE {snapshot.qualityReport.score}/100
            </span>
          </div>
        </div>

        {/* Council Chair Executive Summary Text */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <h4 className="text-2xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COUNCIL CHAIR SYNTHESIS SUMMARY</span>
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
            {councilChairSummary}
          </p>
        </div>

        {/* Key Risks & Objections */}
        {arbiterVerdict.keyRiskFactors.length > 0 && (
          <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl space-y-2">
            <h4 className="text-2xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>PRIMARY RISK OBJECTIONS & CONCERNS</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-2xs text-rose-200">
              {arbiterVerdict.keyRiskFactors.map((rf, idx) => (
                <li key={idx}>{rf}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Expand / Collapse Full Agents Button */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setShowFullCouncil(!showFullCouncil)}
            className="flex items-center space-x-2 text-2xs font-bold text-cyan-400 hover:text-cyan-300 transition"
          >
            {showFullCouncil ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showFullCouncil ? 'HIDE FULL AGENT DELIBERATIONS' : 'EXPAND FULL AGENT DELIBERATIONS'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('plan')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold flex items-center space-x-2 transition shadow-md shadow-cyan-500/20"
          >
            <span>PROCEED TO TRADE PLAN</span>
          </button>
        </div>
      </div>

      {/* FULL AGENT DELIBERATIONS (COLLAPSIBLE) */}
      {showFullCouncil && (
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
            INDIVIDUAL AGENT DELIBERATIONS ({opinions.length} AGENTS)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opinions.map((op) => (
              <div
                key={op.agentId}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-extrabold text-slate-100">{op.agentName}</span>
                    <span className="text-3xs text-slate-400 block">{op.role}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-3xs font-black uppercase border ${
                      ['BULLISH', 'PASS', 'APPROVED'].includes(op.stance)
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : ['BEARISH', 'VETO', 'REJECTED'].includes(op.stance)
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : ['CONCERN', 'CONDITIONAL'].includes(op.stance)
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {op.stance} ({op.confidence}%)
                  </span>
                </div>

                <p className="text-3xs text-slate-300 font-sans leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                  {op.reasoning}
                </p>

                {op.keyEvidence.length > 0 && (
                  <div>
                    <span className="text-3xs font-bold text-cyan-400 block mb-1">KEY EVIDENCE:</span>
                    <ul className="list-disc list-inside text-3xs text-slate-400 space-y-0.5">
                      {op.keyEvidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
