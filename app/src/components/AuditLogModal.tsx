// Frozen Evidence Audit Log Modal for SIGNAL DESK UNIFIED v2.0
import React, { useState } from 'react';
import { CanonicalSnapshot } from '../types';
import { ShieldCheck, Copy, Check, X, FileText, Lock } from 'lucide-react';

interface AuditLogModalProps {
  snapshot: CanonicalSnapshot;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ snapshot, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(snapshot.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 font-mono text-xs select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 text-slate-100 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider uppercase">FROZEN EVIDENCE SHA-256 AUDIT LOG</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SHA-256 Hash Display */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-2xs text-slate-500 font-semibold block uppercase">IMMUTABLE SHA-256 PROOF HASH</span>
          <div className="flex items-center justify-between">
            <code className="text-cyan-400 font-bold text-xs break-all">{snapshot.sha256Hash}</code>
            <button
              onClick={handleCopyHash}
              className="ml-2 p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              title="Copy Hash"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Snapshot Details */}
        <div className="grid grid-cols-2 gap-3 text-2xs">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block">SNAPSHOT ID:</span>
            <span className="text-slate-200 font-bold">{snapshot.snapshotId}</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block">PROVIDER PROVENANCE:</span>
            <span className="text-slate-200 font-bold">{snapshot.providerProvenance}</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block">QUALITY GATE SCORE:</span>
            <span className="text-emerald-400 font-bold">{snapshot.qualityReport.score}/100 ({snapshot.qualityReport.status})</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block">TIMESTAMP:</span>
            <span className="text-slate-200 font-bold">{new Date(snapshot.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Raw Payload Preview */}
        <div>
          <span className="text-slate-400 font-bold text-2xs block mb-1">CANONICAL SNAPSHOT PAYLOAD:</span>
          <pre className="bg-slate-950 p-3 rounded border border-slate-800 max-h-48 overflow-y-auto text-3xs text-slate-300">
            {JSON.stringify(
              {
                snapshotId: snapshot.snapshotId,
                symbol: snapshot.symbol,
                timeframe: snapshot.timeframe,
                currentPrice: snapshot.currentPrice,
                regime: snapshot.regime,
                features: snapshot.features,
                derivatives: snapshot.derivatives,
                sha256Hash: snapshot.sha256Hash,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            CLOSE AUDIT LOG
          </button>
        </div>
      </div>
    </div>
  );
};
