// Historical Replay & Strategy Backtest Engine for SIGNAL DESK UNIFIED v2.0
import React, { useState, useEffect } from 'react';
import { CanonicalSnapshot } from '../types';
import { Play, Pause, SkipForward, RotateCcw, Clock, Layers } from 'lucide-react';

interface ReplayDeskProps {
  snapshot: CanonicalSnapshot;
}

export const ReplayDesk: React.FC<ReplayDeskProps> = ({ snapshot }) => {
  const candles = snapshot.closedCandles;
  const [currentIndex, setCurrentIndex] = useState(candles.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= candles.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speedMs, candles.length]);

  const currentCandle = candles[currentIndex] || candles[candles.length - 1];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-100 flex flex-col space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase">HISTORICAL REPLAY & BACKTEST ENGINE</h2>
            <p className="text-2xs text-slate-400 mt-0.5">Bar-by-bar historical replay to test strategy rules and AI council responses offline.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentIndex(20)}
            className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
          </button>

          <button
            onClick={() => setCurrentIndex((p) => Math.min(candles.length - 1, p + 1))}
            className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Step 1 Bar Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Replay Timeline Progress Bar */}
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex justify-between text-2xs">
          <span className="text-slate-400">REPLAY PROGRESS: {currentIndex + 1} / {candles.length} BARS</span>
          <span className="text-cyan-400 font-bold">DATE: {new Date(currentCandle.timestamp).toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="20"
          max={candles.length - 1}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
          className="w-full accent-cyan-500 bg-slate-800 rounded cursor-pointer"
        />
      </div>

      {/* Replay Candle Bar Data Snapshot */}
      <div className="grid grid-cols-5 gap-3 text-2xs">
        <div className="bg-slate-900 p-3 rounded border border-slate-800">
          <span className="text-slate-500 block uppercase">OPEN</span>
          <span className="font-bold text-slate-100 text-sm mt-0.5 block">${currentCandle.open}</span>
        </div>

        <div className="bg-slate-900 p-3 rounded border border-slate-800">
          <span className="text-slate-500 block uppercase">HIGH</span>
          <span className="font-bold text-emerald-400 text-sm mt-0.5 block">${currentCandle.high}</span>
        </div>

        <div className="bg-slate-900 p-3 rounded border border-slate-800">
          <span className="text-slate-500 block uppercase">LOW</span>
          <span className="font-bold text-rose-400 text-sm mt-0.5 block">${currentCandle.low}</span>
        </div>

        <div className="bg-slate-900 p-3 rounded border border-slate-800">
          <span className="text-slate-500 block uppercase">CLOSE</span>
          <span className="font-bold text-slate-100 text-sm mt-0.5 block">${currentCandle.close}</span>
        </div>

        <div className="bg-slate-900 p-3 rounded border border-slate-800">
          <span className="text-slate-500 block uppercase">VOLUME</span>
          <span className="font-bold text-cyan-400 text-sm mt-0.5 block">{currentCandle.volume.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
