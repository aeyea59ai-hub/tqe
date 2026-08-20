import type {
  Candle,
  CanonicalSnapshot,
  DerivativesData,
  MarketContext,
  MarketStructure,
  OrderBook,
  QualityReport,
  TechnicalFeatures,
} from '../src/types';

/**
 * Deterministic domain fixtures.
 *
 * Every value here is a fixed literal. Fixtures must never use Math.random(),
 * Date.now() or any other ambient source, because the tests that consume them
 * assert deterministic behaviour of the strategy, risk and paper engines.
 */

const BASE_TIMESTAMP = 1_700_000_000_000;

export function buildCandles(count: number, startPrice = 50_000, step = 25): Candle[] {
  const candles: Candle[] = [];
  for (let i = 0; i < count; i += 1) {
    const open = startPrice + i * step;
    const close = open + step;
    candles.push({
      timestamp: BASE_TIMESTAMP + i * 60_000,
      open,
      high: Math.max(open, close) + step,
      low: Math.min(open, close) - step,
      close,
      volume: 1_000 + i,
    });
  }
  return candles;
}

export function buildFeatures(overrides: Partial<TechnicalFeatures> = {}): TechnicalFeatures {
  return {
    ema7: 50_500,
    ema9: 50_450,
    ema20: 50_200,
    ema21: 50_190,
    ema25: 50_100,
    ema50: 49_500,
    ema99: 47_500,
    ema200: 45_000,
    rsi14: 65,
    macd: { macd: 50, signal: 30, histogram: 20 },
    atr14: 500,
    vwap: 50_050,
    bollinger: { upper: 51_000, middle: 50_000, lower: 49_000, bandwidth: 0.04 },
    volumeBaseline20: 1_000,
    volumeRatio: 2.5,
    realizedVolatility: 0.05,
    ...overrides,
  };
}

export function buildDerivatives(overrides: Partial<DerivativesData> = {}): DerivativesData {
  return {
    markPrice: 50_000,
    indexPrice: 49_995,
    fundingRate: 0.0001,
    nextFundingTime: BASE_TIMESTAMP + 3_600_000,
    openInterest: 1_000_000,
    openInterestUsd: 50_000_000_000,
    longShortRatio: 1.5,
    topTraderLongShortRatio: 1.4,
    takerBuySellVolume: 1_200_000,
    takerBuyRatio: 0.6,
    ...overrides,
  };
}

export function buildOrderBook(overrides: Partial<OrderBook> = {}): OrderBook {
  return {
    bids: [
      { price: 49_999, quantity: 12 },
      { price: 49_998, quantity: 8 },
    ],
    asks: [
      { price: 50_001, quantity: 6 },
      { price: 50_002, quantity: 4 },
    ],
    spread: 2,
    spreadPct: 0.00004,
    bidDepthUsd: 1_000_000,
    askDepthUsd: 500_000,
    imbalanceRatio: 2,
    ...overrides,
  };
}

export function buildContext(overrides: Partial<MarketContext> = {}): MarketContext {
  return {
    btcDominance: 56.4,
    fearAndGreedIndex: 60,
    fearAndGreedLabel: 'Greed',
    stablecoinLiquidityCapUsd: 160_000_000_000,
    macroCalendarEvents: [],
    newsSentimentScore: 0.2,
    newsItems: [],
    ...overrides,
  };
}

export function buildStructure(overrides: Partial<MarketStructure> = {}): MarketStructure {
  return {
    swings: [
      { price: 51_000, timestamp: BASE_TIMESTAMP, index: 10, type: 'HH' },
      { price: 49_000, timestamp: BASE_TIMESTAMP + 60_000, index: 20, type: 'HL' },
    ],
    lastBos: { price: 50_500, timestamp: BASE_TIMESTAMP, type: 'BULLISH_BOS' },
    srZones: [
      { id: 'sr-1', priceMin: 48_900, priceMax: 49_100, strength: 4, type: 'SUPPORT', touches: 3 },
    ],
    fvgs: [
      { id: 'fvg-1', top: 49_600, bottom: 49_400, type: 'BULLISH_FVG', timestamp: BASE_TIMESTAMP, filled: false },
    ],
    sweeps: [
      { id: 'sweep-1', price: 49_000, sweptLevel: 49_050, type: 'LOW_SWEEP', timestamp: BASE_TIMESTAMP },
    ],
    breakerBlocks: [
      { id: 'bb-1', top: 49_100, bottom: 48_900, type: 'BULLISH_BREAKER', timestamp: BASE_TIMESTAMP },
    ],
    isRanging: false,
    isCompressing: false,
    candlePatterns: ['BULLISH_PINBAR'],
    ...overrides,
  };
}

export function buildQualityReport(overrides: Partial<QualityReport> = {}): QualityReport {
  return {
    status: 'HEALTHY',
    score: 100,
    freshnessMs: 1_000,
    latencyMs: 40,
    missingCandles: 0,
    schemaValid: true,
    timestampValid: true,
    continuityValid: true,
    providerAgreed: true,
    warnings: [],
    ...overrides,
  };
}

export function buildSnapshot(overrides: Partial<CanonicalSnapshot> = {}): CanonicalSnapshot {
  return {
    snapshotId: 'snap-BTCUSDT-15m-1700000000000',
    symbol: 'BTCUSDT',
    timeframe: '15m',
    currentPrice: 50_000,
    closedCandles: buildCandles(50),
    derivatives: buildDerivatives(),
    orderBook: buildOrderBook(),
    context: buildContext(),
    features: buildFeatures(),
    structure: buildStructure(),
    regime: 'STRONG_BULL_TREND',
    qualityReport: buildQualityReport(),
    providerProvenance: 'fixture',
    timestamp: BASE_TIMESTAMP,
    sha256Hash: 'fixture-hash',
    ...overrides,
  };
}

export { BASE_TIMESTAMP };
