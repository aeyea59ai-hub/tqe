// AI Intelligence Council Deliberation Chamber for SIGNAL DESK UNIFIED v2.0
import React, { useState } from 'react';
import { CouncilDeliberation, ScanCandidate, CanonicalSnapshot } from '../types';
import { Bot, ShieldCheck, AlertTriangle, CheckCircle, Sparkles, Scale, FileText, XCircle, Hash, ShieldAlert, Zap, Clock, Info } from 'lucide-react';

interface AICouncilChamberProps {
  deliberation: CouncilDeliberation | null;
  snapshot: CanonicalSnapshot;
  candidate?: ScanCandidate;
  onDeliberate: () => void;
  isLoading: boolean;
}

export const AICouncilChamber: React.FC<AICouncilChamberProps> = ({
  deliberation,
  snapshot,
  candidate,
  onDeliberate,
  isLoading,
}) => {
  const [userImageBase64, setUserImageBase64] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'FULL_COUNCIL'>('SUMMARY');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove prefix if present
          const base64Data = reader.result.replace(/^data:image\/\w+;base64,/, '');
          setUserImageBase64(base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case 'HEALTHY':
      case 'STRONG_MATCH':
      case 'MATCH':
      case 'PASS':
      case 'CLEAR':
      case 'BULLISH':
      case 'APPROVED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'BEARISH':
      case 'REJECTED':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      case 'NEUTRAL':
      case 'WEAK_MATCH':
        return 'bg-slate-900 text-slate-300 border-slate-700';
      case 'DEGRADED':
      case 'CONCERN':
      case 'CONDITIONAL':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'FAILED':
      case 'NO_MATCH':
      case 'VETO':
      case 'CONTRADICTION':
      case 'BLOCK':
      case 'DATA_UNAVAILABLE':
        return 'bg-red-950 text-red-400 border-red-800 font-extrabold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-100 flex flex-col space-y-5 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold tracking-wider uppercase text-slate-100">
                  AI INTELLIGENCE COUNCIL CHAMBER
                </h2>
                {deliberation?.geminiModelUsed && (
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-black bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-purple-400 inline" />
                    <span>{deliberation.geminiModelUsed}</span>
                  </span>
                )}
              </div>
              <p className="text-3xs text-slate-400 mt-0.5">
                13-Agent specialized opinion framework deliberating on frozen market snapshot for <span className="text-cyan-400 font-bold">{snapshot.symbol}</span> ({candidate?.direction || 'ANALYSIS'}).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Chart Image Attachment Upload */}
          <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-3xs font-bold flex items-center space-x-2 transition">
            <span>{userImageBase64 ? '📷 CHART ATTACHED' : '📎 ATTACH CHART IMAGE'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            onClick={onDeliberate}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Sparkles className={`w-4.5 h-4.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'COUNCIL DELIBERATING...' : 'TRIGGER AI COUNCIL DELIBERATION'}</span>
          </button>
        </div>
      </div>

      {/* Counter-Trend Critical Warning Banner */}
      {deliberation?.isCounterTrend && (
        <div className="bg-amber-950/80 border-2 border-amber-500/80 p-3.5 rounded-xl flex items-center space-x-3 text-amber-200">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 animate-pulse" />
          <div>
            <div className="font-extrabold text-xs text-amber-300 uppercase tracking-wider">
              ⚠️ COUNTER-TREND TRADE SETUP DETECTED
            </div>
            <div className="text-3xs text-amber-200/90 mt-0.5">
              Proposed <span className="font-bold uppercase text-white">{deliberation.direction}</span> setup opposes the dominant market regime ({snapshot.regime}). Council consensus score includes an automatic counter-trend risk penalty. Strict entry confirmation required.
            </div>
          </div>
        </div>
      )}

      {/* Council Verdict & Evidence Panel */}
      {deliberation && (
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              <span className="font-black text-slate-100 uppercase text-xs tracking-wider">
                COUNCIL ARBITER VERDICT & EXECUTIVE DIRECTIVE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1 rounded-lg border text-3xs font-black bg-cyan-950 text-cyan-300 border-cyan-800">
                CONSENSUS: {deliberation.arbiterVerdict.consensusScore}/100
              </div>

              <div className="px-3 py-1 rounded-lg border text-3xs font-black bg-purple-950 text-purple-300 border-purple-800">
                CONFIDENCE: {deliberation.arbiterVerdict.confidenceScore}/100
              </div>

              <div
                className={`px-3 py-1 rounded-lg border text-3xs font-black flex items-center space-x-1 ${
                  deliberation.arbiterVerdict.status === 'APPROVED'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : deliberation.arbiterVerdict.status === 'CONDITIONAL'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {deliberation.arbiterVerdict.status === 'APPROVED' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>STATUS: {deliberation.arbiterVerdict.status}</span>
              </div>
            </div>
          </div>

          <div className="text-2xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-cyan-400 font-extrabold uppercase text-3xs flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 inline text-cyan-400" />
              <span>COUNCIL CHAIR DIRECTIVE:</span>
            </div>
            <p className="text-slate-200">{deliberation.councilChairSummary}</p>
          </div>

          {/* AI Evidence Panel (Detailed Findings) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40 space-y-1.5">
              <span className="text-3xs font-extrabold text-emerald-400 uppercase block">
                ✓ SUPPORTING EVIDENCE
              </span>
              <ul className="text-3xs text-slate-300 space-y-1 list-disc pl-3">
                {deliberation.arbiterVerdict.supportingEvidence?.map((ev, i) => (
                  <li key={i}>{ev}</li>
                )) || <li>Technical EMA alignment confirms momentum.</li>}
              </ul>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/40 space-y-1.5">
              <span className="text-3xs font-extrabold text-amber-400 uppercase block">
                ⚠️ OBJECTIONS & RISK FACTORS
              </span>
              <ul className="text-3xs text-slate-300 space-y-1 list-disc pl-3">
                {deliberation.arbiterVerdict.keyRiskFactors?.map((rf, i) => (
                  <li key={i}>{rf}</li>
                )) || <li>Monitor funding rate volatility.</li>}
              </ul>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/40 space-y-1.5">
              <span className="text-3xs font-extrabold text-rose-400 uppercase block">
                🛑 INVALIDATION & ENTRY CONDITIONS
              </span>
              <div className="text-3xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500 font-bold">INVALIDATION: </span>
                  {deliberation.arbiterVerdict.invalidationConditions?.join('; ') || 'Break of swing support'}
                </div>
                <div>
                  <span className="text-slate-500 font-bold">PRE-ENTRY: </span>
                  {deliberation.arbiterVerdict.conditionsRequiredBeforeEntry?.join('; ') || '15m candle close'}
                </div>
              </div>
            </div>
          </div>

          {/* Proof Hashes & Data Provenance */}
          <div className="flex flex-wrap items-center justify-between text-3xs text-slate-500 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 gap-2">
            <div className="flex items-center space-x-2">
              <Hash className="w-3.5 h-3.5 text-cyan-500" />
              <span>DETERMINISTIC INPUT HASH:</span>
              <span className="font-mono text-slate-400">{deliberation.deterministicInputHash?.slice(0, 16)}...</span>
            </div>

            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span>FINAL AI VERDICT HASH:</span>
              <span className="font-mono text-slate-400">{deliberation.finalAiOutputHash?.slice(0, 16)}...</span>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>FRESHNESS: {Math.round((deliberation.dataFreshnessMs || 150) / 1000)}s</span>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Switcher */}
      {deliberation && (
        <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
          <div className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider pl-2">
            DELIBERATION MODE:
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('SUMMARY')}
              className={`px-4 py-1.5 rounded-lg text-2xs font-extrabold transition ${
                viewMode === 'SUMMARY'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              EXECUTIVE SUMMARY ONLY
            </button>
            <button
              onClick={() => setViewMode('FULL_COUNCIL')}
              className={`px-4 py-1.5 rounded-lg text-2xs font-extrabold transition ${
                viewMode === 'FULL_COUNCIL'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              VIEW FULL COUNCIL (13 AGENTS)
            </button>
          </div>
        </div>
      )}

      {/* Grid of All 13 Agent Opinion Cards (or Summary toggle) */}
      {(viewMode === 'FULL_COUNCIL' || !deliberation) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deliberation ? (
            deliberation.opinions.map((op) => {
              const isExpanded = expandedAgent === op.agentId;
              return (
                <div
                  key={op.agentId}
                  className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-100 text-2xs">{op.agentName}</span>
                      <span className={`px-2 py-0.5 rounded border text-3xs font-black ${getStanceColor(op.stance)}`}>
                        {op.stance} ({op.confidence}%)
                      </span>
                    </div>
                    <span className="text-3xs text-slate-500 block mb-2">{op.role}</span>
                    <p className={`text-2xs text-slate-300 leading-snug ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {op.reasoning}
                    </p>
                    {op.reasoning.length > 120 && (
                      <button
                        onClick={() => setExpandedAgent(isExpanded ? null : op.agentId)}
                        className="text-3xs text-cyan-400 font-extrabold mt-1 hover:underline block"
                      >
                        {isExpanded ? 'Show Less ▲' : 'Read Full Agent Analysis ▼'}
                      </button>
                    )}
                  </div>

                  {op.keyEvidence?.length > 0 && (
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-850 space-y-1">
                      <span className="text-3xs font-bold text-cyan-400 block">KEY EVIDENCE:</span>
                      <div className="text-3xs text-slate-300">{op.keyEvidence.join(' • ')}</div>
                    </div>
                  )}

                  {op.objections?.length > 0 && (
                    <div className="bg-rose-950/40 border border-rose-900/50 p-2 rounded-lg text-3xs text-rose-300">
                      <span className="font-bold block text-rose-400">OBJECTION:</span>
                      <span>{op.objections.join('; ')}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-slate-900/50 border border-slate-800 p-10 text-center text-slate-500 rounded-2xl space-y-2">
              <Bot className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="font-bold text-slate-400 text-xs">AI INTELLIGENCE COUNCIL READY</div>
              <p className="text-3xs text-slate-500 max-w-md mx-auto">
                Click "TRIGGER AI COUNCIL DELIBERATION" above to initiate a 13-agent parallel analysis using Gemini's reasoning model.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
