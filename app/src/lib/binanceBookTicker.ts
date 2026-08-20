type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as UnknownRecord;
}

function parseFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseNonNegativeSafeInteger(value: unknown): number | undefined {
  const parsed = parseFiniteNumber(value);
  if (parsed === undefined) return undefined;
  if (!Number.isSafeInteger(parsed) || parsed < 0) return undefined;
  return parsed;
}

export interface BinanceBookTickerUpdate {
  symbol: string;
  pair: string;
  updateId: number;
  eventTime: number;
  transactionTime: number;
  bestBid: number;
  bestBidQty: number;
  bestAsk: number;
  bestAskQty: number;
  midPrice: number;
}

export function parseBinanceBookTickerMessage(message: unknown): BinanceBookTickerUpdate | undefined {
  const envelope = asRecord(message);
  if (!envelope) return undefined;

  const payload = asRecord(envelope.data) || envelope;
  if (!payload) return undefined;

  if (payload.e !== undefined && payload.e !== 'bookTicker') return undefined;

  const symbol = typeof payload.s === 'string' ? payload.s.trim() : '';
  if (!symbol) return undefined;

  const pair = typeof payload.ps === 'string' && payload.ps.trim() ? payload.ps.trim() : symbol;
  const updateId = parseNonNegativeSafeInteger(payload.u);
  const eventTime = parseNonNegativeSafeInteger(payload.E);
  const transactionTime = parseNonNegativeSafeInteger(payload.T) ?? eventTime;
  const bestBid = parseFiniteNumber(payload.b);
  const bestBidQty = parseFiniteNumber(payload.B);
  const bestAsk = parseFiniteNumber(payload.a);
  const bestAskQty = parseFiniteNumber(payload.A);

  if (
    updateId === undefined ||
    eventTime === undefined ||
    transactionTime === undefined ||
    bestBid === undefined ||
    bestBidQty === undefined ||
    bestAsk === undefined ||
    bestAskQty === undefined
  ) {
    return undefined;
  }

  if (bestBid <= 0 || bestAsk <= 0 || bestBidQty < 0 || bestAskQty < 0) return undefined;

  return {
    symbol,
    pair,
    updateId,
    eventTime,
    transactionTime,
    bestBid,
    bestBidQty,
    bestAsk,
    bestAskQty,
    midPrice: (bestBid + bestAsk) / 2,
  };
}
