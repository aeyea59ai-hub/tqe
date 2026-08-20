// Order Book Depth & Derivatives Data Visualizer for SIGNAL DESK UNIFIED v2.0
import React from 'react';
import { CanonicalSnapshot } from '../types';
import { TrendingUp, TrendingDown, Layers, DollarSign } from 'lucide-react';

interface OrderBookDepthProps {
  snapshot: CanonicalSnapshot;
}

export const OrderBookDepth: React.FC<OrderBookDepthProps> = ({ snapshot }) => {
  const ob = snapshot.orderBook;
  const d = snapshot.derivatives;

  const maxAskQty = Math.max(...ob.asks.map((a) => a.quantity), 1);
  const maxBidQty = Math.max(...ob.bids.map((b) => b.quantity), 1);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col h-full font-mono text-xs select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center space-x-1.5 font-bold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>ORDER BOOK DEPTH</span>
        </div>
        <div className="flex items-center space-x-2 text-2xs">
          <span className="text-slate-400">Spread:</span>
          <span className="text-slate-200 font-semibold">${ob.spread} ({ob.spreadPct.toFixed(3)}%)</span>
        </div>
      </div>

      {/* Imbalance Meter */}
      <div className="bg-slate-900/80 p-2 rounded border border-slate-800 mb-3">
        <div className="flex justify-between items-center text-2xs mb-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> BID DEPTH ${Math.round(ob.bidDepthUsd / 1000)}k
          </span>
          <span className="text-slate-300 font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
            RATIO: {ob.imbalanceRatio} {ob.imbalanceRatio > 1.2 ? 'BID HEAVY' : ob.imbalanceRatio < 0.8 ? 'ASK HEAVY' : 'BALANCED'}
          </span>
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            ASK DEPTH ${Math.round(ob.askDepthUsd / 1000)}k <TrendingDown className="w-3 h-3" />
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(90, Math.max(10, (ob.bidDepthUsd / (ob.bidDepthUsd + ob.askDepthUsd)) * 100))}%` }}
          />
          <div className="bg-rose-500 h-full flex-1" />
        </div>
      </div>

      {/* Order Book Rows */}
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-[220px]">
        {/* Asks (Sells) */}
        <div className="flex flex-col justify-end space-y-0.5 border-r border-slate-900 pr-1">
          <div className="text-2xs text-slate-500 pb-1 border-b border-slate-900 flex justify-between">
            <span>PRICE</span>
            <span>QTY</span>
          </div>
          {ob.asks.slice(0, 7).reverse().map((ask, idx) => (
            <div key={idx} className="relative flex justify-between text-2xs py-0.5 px-1 rounded overflow-hidden">
              <div
                className="absolute right-0 top-0 bottom-0 bg-rose-500/15 transition-all"
                style={{ width: `${(ask.quantity / maxAskQty) * 100}%` }}
              />
              <span className="text-rose-400 font-semibold z-10">${ask.price.toFixed(snapshot.currentPrice > 100 ? 2 : 4)}</span>
              <span className="text-slate-300 z-10">{ask.quantity}</span>
            </div>
          ))}
        </div>

        {/* Bids (Buys) */}
        <div className="flex flex-col space-y-0.5 pl-1">
          <div className="text-2xs text-slate-500 pb-1 border-b border-slate-900 flex justify-between">
            <span>PRICE</span>
            <span>QTY</span>
          </div>
          {ob.bids.slice(0, 7).map((bid, idx) => (
            <div key={idx} className="relative flex justify-between text-2xs py-0.5 px-1 rounded overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 transition-all"
                style={{ width: `${(bid.quantity / maxBidQty) * 100}%` }}
              />
              <span className="text-emerald-400 font-semibold z-10">${bid.price.toFixed(snapshot.currentPrice > 100 ? 2 : 4)}</span>
              <span className="text-slate-300 z-10">{bid.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Derivatives Intelligence Panel */}
      <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-2xs">
        <div className="bg-slate-900 p-2 rounded border border-slate-800">
          <span className="text-slate-400 block mb-0.5">FUNDING RATE (8h)</span>
          <span className={`font-bold text-xs ${d.fundingRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(d.fundingRate * 100).toFixed(4)}%
          </span>
        </div>

        <div className="bg-slate-900 p-2 rounded border border-slate-800">
          <span className="text-slate-400 block mb-0.5">OPEN INTEREST</span>
          <span className="font-bold text-xs text-cyan-400">${(d.openInterestUsd / 1e6).toFixed(2)}M</span>
        </div>

        <div className="bg-slate-900 p-2 rounded border border-slate-800">
          <span className="text-slate-400 block mb-0.5">LONG / SHORT RATIO</span>
          <span className="font-bold text-xs text-slate-200">{d.longShortRatio}</span>
        </div>

        <div className="bg-slate-900 p-2 rounded border border-slate-800">
          <span className="text-slate-400 block mb-0.5">TAKER BUY RATIO</span>
          <span className={`font-bold text-xs ${d.takerBuyRatio >= 0.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(d.takerBuyRatio * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
