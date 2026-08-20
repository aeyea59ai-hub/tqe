// Interactive Candlestick Chart Component for SIGNAL DESK UNIFIED v2.0
import React, { useRef, useEffect, useState } from 'react';
import { CanonicalSnapshot } from '../types';

interface PriceChartProps {
  snapshot: CanonicalSnapshot;
  onTimeframeChange: (tf: string) => void;
}

export const PriceChart: React.FC<PriceChartProps> = ({ snapshot, onTimeframeChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showEMAs, setShowEMAs] = useState(true);
  const [showFVGs, setShowFVGs] = useState(true);
  const [showSwings, setShowSwings] = useState(true);
  const [showSR, setShowSR] = useState(true);

  const timeframes = ['1m', '5m', '15m', '1h', '4h'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas for high DPR displays
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const candles = snapshot.closedCandles;
    if (!candles || candles.length === 0) return;

    // Determine min/max price for scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    candles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    const pricePadding = (maxPrice - minPrice) * 0.08;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice || 1;

    // Chart margins
    const paddingLeft = 10;
    const paddingRight = 65;
    const paddingTop = 25;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const candleCount = candles.length;
    const candleWidth = chartWidth / candleCount;
    const bodyWidth = Math.max(1, candleWidth * 0.7);

    // Y coordinate mapping
    const getY = (price: number) => {
      return paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    // Draw Grid Lines & Price Scale
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '10px monospace';

    const gridRows = 6;
    for (let i = 0; i <= gridRows; i++) {
      const priceVal = minPrice + (priceRange / gridRows) * i;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillText(priceVal.toFixed(snapshot.currentPrice > 100 ? 2 : 4), width - paddingRight + 6, y + 3);
    }

    // Draw Support & Resistance Zones
    if (showSR && snapshot.structure.srZones) {
      snapshot.structure.srZones.forEach((sr) => {
        const yMin = getY(sr.priceMin);
        const yMax = getY(sr.priceMax);
        const srHeight = Math.max(2, Math.abs(yMin - yMax));

        ctx.fillStyle = sr.type === 'SUPPORT' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';
        ctx.fillRect(paddingLeft, Math.min(yMin, yMax), chartWidth, srHeight);

        ctx.strokeStyle = sr.type === 'SUPPORT' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
        ctx.strokeRect(paddingLeft, Math.min(yMin, yMax), chartWidth, srHeight);
      });
    }

    // Draw Fair Value Gaps (FVGs)
    if (showFVGs && snapshot.structure.fvgs) {
      snapshot.structure.fvgs.forEach((fvg) => {
        if (fvg.filled) return;
        const yTop = getY(fvg.top);
        const yBottom = getY(fvg.bottom);
        const fvgHeight = Math.max(2, Math.abs(yTop - yBottom));

        ctx.fillStyle = fvg.type === 'BULLISH_FVG' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(251, 146, 60, 0.15)';
        ctx.fillRect(paddingLeft, Math.min(yTop, yBottom), chartWidth, fvgHeight);

        ctx.strokeStyle = fvg.type === 'BULLISH_FVG' ? 'rgba(34, 211, 238, 0.5)' : 'rgba(251, 146, 60, 0.5)';
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(paddingLeft, Math.min(yTop, yBottom), chartWidth, fvgHeight);
        ctx.setLineDash([]);
      });
    }

    // Draw Candlesticks
    candles.forEach((c, idx) => {
      const x = paddingLeft + idx * candleWidth + candleWidth / 2;
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const highY = getY(c.high);
      const lowY = getY(c.low);

      const isGreen = c.close >= c.open;
      const color = isGreen ? '#10b981' : '#f43f5e';

      // High-Low Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(1.5, Math.abs(closeY - openY));
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, bodyY, bodyWidth, bodyH);
    });

    // Draw Swing Points
    if (showSwings && snapshot.structure.swings) {
      snapshot.structure.swings.forEach((s) => {
        if (s.index >= 0 && s.index < candleCount) {
          const x = paddingLeft + s.index * candleWidth + candleWidth / 2;
          const y = getY(s.price);

          ctx.fillStyle = s.type === 'HH' || s.type === 'LH' ? '#38bdf8' : '#f472b6';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';

          const offsetY = s.type === 'HH' || s.type === 'LH' ? y - 8 : y + 12;
          ctx.fillText(s.type, x, offsetY);
        }
      });
    }

    // Current Price Line
    const currentY = getY(snapshot.currentPrice);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, currentY);
    ctx.lineTo(width - paddingRight, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price badge
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(width - paddingRight, currentY - 10, paddingRight, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(snapshot.currentPrice.toFixed(snapshot.currentPrice > 100 ? 2 : 4), width - paddingRight + 4, currentY + 3);

  }, [snapshot, showEMAs, showFVGs, showSwings, showSR]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col h-full select-none">
      {/* Chart Top Controls */}
      <div className="flex items-center justify-between mb-2 text-xs border-b border-slate-900 pb-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-slate-200">{snapshot.symbol}</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-mono font-semibold">${snapshot.currentPrice.toLocaleString()}</span>
          <span className="text-slate-500">•</span>
          <span className="text-2xs px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
            REGIME: {snapshot.regime}
          </span>
        </div>

        {/* Timeframe selector & Toggles */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800 font-mono">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded text-2xs transition ${
                  snapshot.timeframe === tf ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-2xs font-mono text-slate-400">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" checked={showFVGs} onChange={(e) => setShowFVGs(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0" />
              <span>FVG</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" checked={showSwings} onChange={(e) => setShowSwings(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0" />
              <span>Swings</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" checked={showSR} onChange={(e) => setShowSR(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0" />
              <span>S/R</span>
            </label>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 min-h-[360px] w-full">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Bottom Technical Feature Strip */}
      <div className="grid grid-cols-6 gap-2 mt-2 pt-2 border-t border-slate-900 text-2xs font-mono">
        <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-500 block">EMA (7/20/50)</span>
          <span className="text-slate-200 font-semibold">
            {snapshot.features.ema7?.toFixed(1)} / {snapshot.features.ema20?.toFixed(1)} / {snapshot.features.ema50?.toFixed(1)}
          </span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-500 block">RSI (14)</span>
          <span className={`font-semibold ${snapshot.features.rsi14 >= 60 ? 'text-emerald-400' : snapshot.features.rsi14 <= 40 ? 'text-rose-400' : 'text-slate-200'}`}>
            {snapshot.features.rsi14?.toFixed(1)}
          </span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-500 block">MACD Hist</span>
          <span className={`font-semibold ${snapshot.features.macd?.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {snapshot.features.macd?.histogram?.toFixed(3)}
          </span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-500 block">ATR (14)</span>
          <span className="text-slate-200 font-semibold">${snapshot.features.atr14?.toFixed(2)}</span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-500 block">Vol Ratio</span>
          <span className="text-cyan-400 font-semibold">{snapshot.features.volumeRatio?.toFixed(2)}x</span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-500 block">Realized Vol</span>
          <span className="text-slate-200 font-semibold">{(snapshot.features.realizedVolatility * 100)?.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
