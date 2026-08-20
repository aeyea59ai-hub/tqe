// Batch AI Market Review & Opportunity Board - Blueprint Section 10 & 11
import React, { useState } from 'react';
import { ScanCandidate, CanonicalSnapshot, CouncilDeliberation } from '../types';
import { Cpu, Play, CheckCircle2, Clock, ShieldAlert, AlertTriangle, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface BatchAIScanProps {
  candidates?: ScanCandidate[];
  snapshotMap?: Record<string, CanonicalSnapshot>;
  onSelectSymbol?: (symbol: string) => void;
  onNavigateTab?: (tab: string) => void;
  onDeliberateAll?: () => void;
  onSelectCandidate?: (candidate: ScanCandidate) => void;
  isLoading?: boolean;
}

interface ReviewResult {
  candidateId: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  strategyCode: string;
  qualityScore: number;
  status: 'APPROVED' | 'CONDITIONAL' | 'WATCH' | 'REJECTED' | 'DATA_UNAVAILABLE';
  consensusScore: number;
  reasoning: string;
  redTeamPassed: boolean;
  objections: string[];
}

export const BatchAIScan: React.FC<BatchAIScanProps> = ({
  candidates = [],
  snapshotMap = {},
  onSelectSymbol,
  onNavigateTab,
}) => {
  const safeCandidates = candidates || [];
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(() =>
    safeCandidates.slice(0, 5).map((c) => c.id)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [reviewResults, setReviewResults] = useState<ReviewResult[]>([]);

  const toggleCandidateSelect = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter((c) => c !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  const selectPreset = (mode: 'ALL' | 'TOP_5' | 'TOP_10' | 'LONG' | 'SHORT') => {
    if (mode === 'ALL') setSelectedCandidates(candidates.map((c) => c.id));
    if (mode === 'TOP_5') setSelectedCandidates(candidates.slice(0, 5).map((c) => c.id));
    if (mode === 'TOP_10') setSelectedCandidates(candidates.slice(0, 10).map((c) => c.id));
    if (mode === 'LONG') setSelectedCandidates(candidates.filter((c) => c.direction === 'LONG').map((c) => c.id));
    if (mode === 'SHORT') setSelectedCandidates(candidates.filter((c) => c.direction === 'SHORT').map((c) => c.id));
  };

  const executeBatchAIReview = async () => {
    if (selectedCandidates.length === 0) return;
    setIsProcessing(true);
    setProgressIndex(0);
    setReviewResults([]);

    const itemsToProcess = candidates.filter((c) => selectedCandidates.includes(c.id));
    const newResults: ReviewResult[] = [];

    for (let i = 0; i < itemsToProcess.length; i++) {
      const cand = itemsToProcess[i];
      setProgressIndex(i + 1);

      try {
        const snapshot = snapshotMap[cand.symbol] || cand.snapshot;
        const res = await fetch('/api/ai/council-deliberate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            snapshot,
            direction: cand.direction,
            strategyCode: cand.strategyCode,
          }),
        });

        const data = await res.json();

        if (data.success && data.deliberation) {
          const delib: CouncilDeliberation = data.deliberation;
          newResults.push({
            candidateId: cand.id,
            symbol: cand.symbol,
            direction: cand.direction,
            strategyCode: cand.strategyCode,
            qualityScore: cand.qualityScore,
            status: delib.arbiterVerdict.status,
            consensusScore: delib.arbiterVerdict.consensusScore,
            reasoning: delib.councilChairSummary,
            redTeamPassed: delib.arbiterVerdict.redTeamPassed,
            objections: delib.arbiterVerdict.keyRiskFactors,
          });
        }
      } catch (err) {
        console.error(`AI review error for ${cand.symbol}:`, err);
      }
    }

    setReviewResults(newResults);
    setIsProcessing(false);
  };

  const executePrimeCheckAll = async () => {
    setIsProcessing(true);
    setProgressIndex(1);
    try {
      const res = await fetch('/api/prime/check-all', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.records) {
        const primeResults: ReviewResult[] = data.records.map((r: any, idx: number) => ({
          candidateId: `prime-${r.symbol}-${idx}`,
          symbol: r.symbol,
          direction: r.direction,
          strategyCode: r.topStrategy,
          qualityScore: r.qualityScore,
          status: r.arbiterStatus,
          consensusScore: r.consensusScore,
          reasoning: `Prime Check: Quality Gate ${r.qualityStatus} (${r.qualityScore}/100) — Macro regime: ${r.regime}. Council arbiter: ${r.arbiterStatus}. Hash: ${r.sha256Hash.slice(0, 10)}...`,
          redTeamPassed: r.redTeamPassed,
          objections: r.redTeamPassed ? [] : ['Flagged by Red Team Challenger in Prime Review'],
        }));
        setReviewResults(primeResults);
      }
    } catch (err) {
      console.error('Prime check all failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Batch Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                BATCH AI MARKET REVIEW & OPPORTUNITY BOARD
              </h3>
              <p className="text-3xs text-slate-400">
                PARALLEL DELIBERATION OF QUALIFIED DETERMINISTIC SCANNER CANDIDATES
              </p>
            </div>
          </div>

          {/* Selection Preset Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => selectPreset('ALL')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-3xs font-bold"
            >
              SELECT ALL ({candidates.length})
            </button>
            <button
              onClick={() => selectPreset('TOP_5')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-3xs font-bold"
            >
              TOP 5
            </button>
            <button
              onClick={() => selectPreset('TOP_10')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-3xs font-bold"
            >
              TOP 10
            </button>
            <button
              onClick={() => selectPreset('LONG')}
              className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-3xs font-bold"
            >
              LONGS ONLY
            </button>
            <button
              onClick={() => selectPreset('SHORT')}
              className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800/80 text-3xs font-bold"
            >
              SHORTS ONLY
            </button>
          </div>
        </div>

        {/* Selected Candidates Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
          {candidates.map((cand) => {
            const isSelected = selectedCandidates.includes(cand.id);
            return (
              <div
                key={cand.id}
                onClick={() => toggleCandidateSelect(cand.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/60 text-purple-200'
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-black text-slate-100">{cand.symbol}</div>
                  <div className="text-3xs text-slate-400">
                    {cand.strategyCode} • SCORE {cand.qualityScore}
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isSelected
                      ? 'bg-purple-500 border-purple-400 text-slate-950'
                      : 'border-slate-700'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-2xs text-slate-400">
            {selectedCandidates.length} CANDIDATES SELECTED FOR AI REVIEW
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={executePrimeCheckAll}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold flex items-center space-x-2 transition shadow-lg shadow-cyan-600/25 disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>PERFORM PRIME CHECK ON ALL RECORDS</span>
            </button>

            <button
              onClick={executeBatchAIReview}
              disabled={isProcessing || selectedCandidates.length === 0}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center space-x-2 transition shadow-lg shadow-purple-600/25 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>
                {isProcessing
                  ? `REVIEWING (${progressIndex}/${selectedCandidates.length})...`
                  : 'ANALYZE SELECTED WITH AI'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress UI indicator */}
      {isProcessing && (
        <div className="bg-slate-950 border border-purple-800/60 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-2xs font-bold text-purple-300">
            <span>AI DELIBERATION JOB RUNNING</span>
            <span>{Math.round((progressIndex / selectedCandidates.length) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${(progressIndex / selectedCandidates.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* OPPORTUNITY BOARD RESULTS */}
      {reviewResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              CONSOLIDATED OPPORTUNITY BOARD
            </h4>
            <span className="text-3xs text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded">
              {reviewResults.filter((r) => r.status === 'APPROVED').length} AI APPROVED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* APPROVED LANES */}
            {['APPROVED', 'CONDITIONAL', 'WATCH', 'REJECTED'].map((statusKey) => {
              const statusItems = reviewResults.filter((r) => r.status === statusKey);
              return (
                <div
                  key={statusKey}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span
                      className={`text-2xs font-black uppercase tracking-wider ${
                        statusKey === 'APPROVED'
                          ? 'text-emerald-400'
                          : statusKey === 'CONDITIONAL'
                          ? 'text-amber-400'
                          : statusKey === 'WATCH'
                          ? 'text-cyan-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {statusKey} ({statusItems.length})
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                    {statusItems.length === 0 ? (
                      <div className="text-3xs text-slate-600 p-4 text-center">
                        NO CANDIDATES IN THIS LANE
                      </div>
                    ) : (
                      statusItems.map((res) => (
                        <div
                          key={res.candidateId}
                          className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-100">
                              {res.symbol}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-3xs font-black ${
                                res.direction === 'LONG'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {res.direction}
                            </span>
                          </div>

                          <div className="text-3xs text-slate-400 flex justify-between">
                            <span>STRATEGY: {res.strategyCode}</span>
                            <span>CONSENSUS: {res.consensusScore}%</span>
                          </div>

                          <p className="text-3xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-850 line-clamp-3">
                            {res.reasoning}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span
                              className={`text-3xs font-bold ${
                                res.redTeamPassed ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              RED TEAM: {res.redTeamPassed ? 'PASSED' : 'VETOED'}
                            </span>

                            <button
                              onClick={() => {
                                onSelectSymbol?.(res.symbol);
                                onNavigateTab?.('workspace');
                              }}
                              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold border border-cyan-800 transition text-3xs"
                            >
                              WORKSPACE
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
