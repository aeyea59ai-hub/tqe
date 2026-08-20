// Normalized Live Market Store & Price Type Architecture
// Provides a single source of truth for live prices across all components

export type PriceType = 
  | 'LIVE_LAST' 
  | 'MARK_PRICE' 
  | 'INDEX_PRICE' 
  | 'ANALYSIS_SNAPSHOT' 
  | 'DECISION_ENTRY' 
  | 'PAPER_FILL';

export interface NormalizedMarketItem {
  symbol: string;
  assetName: string;
  contractType: string;
  lastPrice: number;
  markPrice: number;
  indexPrice: number;
  bestBid: number;
  bestAsk: number;
  change24h: number;
  volume24h: number;
  fundingRate: number;
  openInterest: number;
  timestamp: number;
  source: string;
  stale: boolean;
  snapshotId?: string;
}

export interface TaggedPrice {
  value: number;
  type: PriceType;
  label: string;
  timestamp?: number;
  snapshotId?: string;
  isLive: boolean;
}

// In-memory store for normalized market snapshots
const marketStore: Record<string, NormalizedMarketItem> = {};
const subscribers: Set<() => void> = new Set();

export function updateMarketStoreItem(item: NormalizedMarketItem) {
  marketStore[item.symbol] = {
    ...item,
    timestamp: Number.isFinite(item.timestamp) && item.timestamp > 0 ? item.timestamp : Date.now(),
    stale: false,
  };
  notifySubscribers();
}

export function batchUpdateMarketStore(items: NormalizedMarketItem[]) {
  const now = Date.now();
  items.forEach((item) => {
    const itemTimestamp = Number.isFinite(item.timestamp) && item.timestamp > 0 ? item.timestamp : now;
    marketStore[item.symbol] = {
      ...item,
      timestamp: itemTimestamp,
      stale: false,
    };
  });
  notifySubscribers();
}

export function getMarketStoreItem(symbol: string): NormalizedMarketItem | undefined {
  return marketStore[symbol];
}

export function getAllMarketStoreItems(): NormalizedMarketItem[] {
  return Object.values(marketStore);
}

export function subscribeMarketStore(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('Market store subscriber error:', err);
    }
  });
}

import { useState, useEffect } from 'react';

export function useMarketStore() {
  const [markets, setMarkets] = useState<NormalizedMarketItem[]>(getAllMarketStoreItems());

  useEffect(() => {
    const unsubscribe = subscribeMarketStore(() => {
      setMarkets(getAllMarketStoreItems());
    });
    return unsubscribe;
  }, []);

  return markets;
}

export function useMarketStoreItem(symbol: string) {
  const [item, setItem] = useState<NormalizedMarketItem | undefined>(getMarketStoreItem(symbol));

  useEffect(() => {
    const unsubscribe = subscribeMarketStore(() => {
      setItem(getMarketStoreItem(symbol));
    });
    return unsubscribe;
  }, [symbol]);

  return item;
}

// Helper to format tagged prices clearly with explicit labels
export function formatTaggedPrice(price: TaggedPrice): {
  formatted: string;
  typeLabel: string;
  badgeClass: string;
  timestampText: string;
} {
  const formatted = `$${price.value.toLocaleString('en-US', {
    minimumFractionDigits: price.value < 1 ? 4 : 2,
    maximumFractionDigits: price.value < 1 ? 4 : 2,
  })}`;

  let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
  let typeLabel = price.label;

  switch (price.type) {
    case 'LIVE_LAST':
      badgeClass = 'bg-cyan-950 text-cyan-400 border-cyan-800';
      typeLabel = 'LIVE LAST';
      break;
    case 'MARK_PRICE':
      badgeClass = 'bg-blue-950 text-blue-400 border-blue-800';
      typeLabel = 'MARK PRICE';
      break;
    case 'ANALYSIS_SNAPSHOT':
      badgeClass = 'bg-amber-950 text-amber-400 border-amber-800';
      typeLabel = 'ANALYSIS SNAPSHOT';
      break;
    case 'DECISION_ENTRY':
      badgeClass = 'bg-emerald-950 text-emerald-400 border-emerald-800';
      typeLabel = 'TRADE PLAN ENTRY';
      break;
    case 'PAPER_FILL':
      badgeClass = 'bg-purple-950 text-purple-400 border-purple-800';
      typeLabel = 'PAPER FILL';
      break;
  }

  const timestampText = price.timestamp
    ? new Date(price.timestamp).toLocaleTimeString('en-US', { hour12: false })
    : 'Live';

  return { formatted, typeLabel, badgeClass, timestampText };
}
