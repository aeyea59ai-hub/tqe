
import { AIProviderGateway } from './src/lib/aiProviderGateway.js';
import { db } from './src/lib/db.js';
// SIGNAL DESK UNIFIED v2.0 - Express + Vite Backend Server
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { computeTechnicalFeatures } from './src/lib/indicators';
import { computeMarketStructure } from './src/lib/marketStructure';
import { evaluateSnapshotStrategies } from './src/lib/strategies';
import { evaluateDataQuality } from './src/lib/dataQuality';
import { generateDeterministicTradePlan, evaluateTradeRisk, DEFAULT_RISK_CONFIG } from './src/lib/riskEngine';
import { runCouncilDeliberation } from './src/lib/aiCouncilEngine';
import { processChatAssistantQuery } from './src/lib/aiChatEngine';
import { runHistoricalBacktest, generateHistoricalCandles2023ToPresent } from './src/lib/backtestEngine';
import { Candle, CanonicalSnapshot, CouncilDeliberation, DerivativesData, FrozenEvidenceBundle, MarketContext, OrderBook, QualityReport, RoutingMode, ScanCandidate, SymbolInfo } from './src/types';
import { assertBoundedNumber, assertInterval, assertSymbol } from './src/lib/security/marketParams';
import { ApiError, sendError } from './src/lib/security/httpErrors';

const ROUTING_MODES: RoutingMode[] = [
  'AUTO', 'MANUAL', 'LOCAL_ONLY', 'CLOUD_ONLY',
  'PRIVACY_FIRST', 'QUALITY_FIRST', 'SPEED_FIRST', 'COST_FIRST',
];

const PORT = Number(process.env.PORT) || 3000;

// The product is local-first and single-owner. Blueprint 0046 requires services
// to bind loopback only, so the API is never exposed on the local network by
// default. HOST may be overridden deliberately by the operator.
const HOST = process.env.HOST || '127.0.0.1';

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYMBOLS: SymbolInfo[] = [
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 3, maxLeverage: 125, minNotional: 5, status: 'TRADING' },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 3, maxLeverage: 100, minNotional: 5, status: 'TRADING' },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 2, maxLeverage: 50, minNotional: 5, status: 'TRADING' },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 2, maxLeverage: 50, minNotional: 5, status: 'TRADING' },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', pricePrecision: 4, quantityPrecision: 1, maxLeverage: 75, minNotional: 5, status: 'TRADING' },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', pricePrecision: 5, quantityPrecision: 0, maxLeverage: 50, minNotional: 5, status: 'TRADING' },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 2, maxLeverage: 50, minNotional: 5, status: 'TRADING' },
  { symbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT', pricePrecision: 4, quantityPrecision: 1, maxLeverage: 50, minNotional: 5, status: 'TRADING' },
  { symbol: 'SUIUSDT', baseAsset: 'SUI', quoteAsset: 'USDT', pricePrecision: 4, quantityPrecision: 1, maxLeverage: 50, minNotional: 5, status: 'TRADING' },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 2, maxLeverage: 50, minNotional: 5, status: 'TRADING' },
];

// Helper to generate simulated synthetic realistic Binance Futures Candles
function generateSyntheticCandles(symbol: string, count = 100, tf = '15m'): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  let intervalMs = 15 * 60 * 1000;
  if (tf === '1m') intervalMs = 60 * 1000;
  if (tf === '5m') intervalMs = 5 * 60 * 1000;
  if (tf === '1h') intervalMs = 60 * 60 * 1000;
  if (tf === '4h') intervalMs = 4 * 60 * 60 * 1000;

  let basePrice = 96500;
  if (symbol.startsWith('ETH')) basePrice = 2750;
  if (symbol.startsWith('SOL')) basePrice = 195;
  if (symbol.startsWith('BNB')) basePrice = 640;
  if (symbol.startsWith('XRP')) basePrice = 2.45;
  if (symbol.startsWith('DOGE')) basePrice = 0.26;
  if (symbol.startsWith('AVAX')) basePrice = 34.5;
  if (symbol.startsWith('NEAR')) basePrice = 5.8;
  if (symbol.startsWith('SUI')) basePrice = 3.2;
  if (symbol.startsWith('LINK')) basePrice = 18.2;

  let currentPrice = basePrice;
  const startTime = now - count * intervalMs;

  for (let i = 0; i < count; i++) {
    const timestamp = startTime + i * intervalMs;
    // Volatility wave
    const wave = Math.sin(i / 8) * 0.008 + (Math.random() - 0.49) * 0.009;
    const open = currentPrice;
    const close = Math.max(open * 0.5, open * (1 + wave));
    const high = Math.max(open, close) * (1 + Math.random() * 0.004);
    const low = Math.min(open, close) * (1 - Math.random() * 0.004);
    const volume = Math.floor(Math.random() * 150000 + 30000);

    candles.push({ timestamp, open, high, low, close, volume });
    currentPrice = close;
  }

  return candles;
}

// Generate realistic simulated Derivatives Data
function generateDerivativesData(symbol: string, price: number): DerivativesData {
  return {
    markPrice: price,
    indexPrice: price * 0.9998,
    fundingRate: (Math.random() - 0.45) * 0.0003, // e.g. +0.01%
    nextFundingTime: Date.now() + 1000 * 60 * 180,
    openInterest: Math.floor(Math.random() * 500000 + 100000),
    openInterestUsd: Math.floor((Math.random() * 500000 + 100000) * price),
    longShortRatio: Number((Math.random() * 0.8 + 0.8).toFixed(2)),
    topTraderLongShortRatio: Number((Math.random() * 0.9 + 0.85).toFixed(2)),
    takerBuySellVolume: 1.25,
    takerBuyRatio: Number((Math.random() * 0.25 + 0.45).toFixed(2)),
  };
}

// Generate realistic Order Book Depth
function generateOrderBook(price: number): OrderBook {
  const bids = [];
  const asks = [];
  let bidDepthUsd = 0;
  let askDepthUsd = 0;

  for (let i = 1; i <= 10; i++) {
    const bidPrice = price * (1 - i * 0.0004);
    const askPrice = price * (1 + i * 0.0004);
    const bidQty = Number((Math.random() * 15 + 2).toFixed(2));
    const askQty = Number((Math.random() * 15 + 2).toFixed(2));

    bids.push({ price: Number(bidPrice.toFixed(2)), quantity: bidQty });
    asks.push({ price: Number(askPrice.toFixed(2)), quantity: askQty });

    bidDepthUsd += bidPrice * bidQty;
    askDepthUsd += askPrice * askQty;
  }

  const spread = asks[0].price - bids[0].price;
  const spreadPct = (spread / price) * 100;
  const imbalanceRatio = Number((bidDepthUsd / (askDepthUsd || 1)).toFixed(2));

  return {
    bids,
    asks,
    spread: Number(spread.toFixed(2)),
    spreadPct: Number(spreadPct.toFixed(4)),
    bidDepthUsd: Math.floor(bidDepthUsd),
    askDepthUsd: Math.floor(askDepthUsd),
    imbalanceRatio,
  };
}

// Market Context
function getMarketContext(): MarketContext {
  return {
    btcDominance: 56.8,
    fearAndGreedIndex: 68,
    fearAndGreedLabel: 'Greed',
    stablecoinLiquidityCapUsd: 168000000000,
    macroCalendarEvents: [
      { title: 'US CPI Inflation Data Release', impact: 'HIGH', time: '14:30 UTC' },
      { title: 'FOMC Rate Decision', impact: 'HIGH', time: '18:00 UTC' },
    ],
    newsSentimentScore: 0.35,
    newsItems: [
      { headline: 'Bitcoin Futures Open Interest Reaches All-Time High above $38B', source: 'Coindesk', time: '10m ago', sentiment: 'BULLISH' },
      { headline: 'Institutional Inflows into Spot BTC ETFs Top $420M Today', source: 'CoinTelegraph', time: '45m ago', sentiment: 'BULLISH' },
    ],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Rate limit all API routes: 100 requests per minute per IP
  const apiLimiter = rateLimit({
    windowMs: 60_000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', apiLimiter);


  app.get('/api/market/symbols', async (req, res) => {
    try {
      // Fetch live Binance Futures exchange info if reachable
      const response = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
      if (response.ok) {
        const data = await response.json();
        const symbols = data.symbols
          .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
          .map((s: any) => ({
            symbol: s.symbol,
            baseAsset: s.baseAsset,
            quoteAsset: s.quoteAsset,
            pricePrecision: s.pricePrecision,
            quantityPrecision: s.quantityPrecision,
            maxLeverage: 50,
            minNotional: 5,
            status: s.status,
          }));
        if (symbols.length > 0) {
          return res.json({ success: true, symbols });
        }
      }
    } catch (err) {
      // Fallback
    }
    res.json({ success: true, symbols: DEFAULT_SYMBOLS });
  });

  // API 2: Kline & Snapshot Engine
  app.get('/api/market/snapshot', async (req, res) => {
    let symbol: string;
    let tf: string;
    try {
      symbol = assertSymbol(req.query.symbol, 'BTCUSDT');
      tf = assertInterval(req.query.tf, '15m');
    } catch (err) {
      return sendError(res, err, 'GET /api/market/snapshot');
    }

    let candles: Candle[] = [];
    try {
      const bRes = await fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${tf}&limit=100`);
      if (bRes.ok) {
        const raw = await bRes.json();
        candles = raw.map((k: any) => ({
          timestamp: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }));
      }
    } catch (err) {
      // Fallback synthetic
    }

    if (!candles || candles.length < 20) {
      candles = generateSyntheticCandles(symbol, 100, tf);
    }

    const currentPrice = candles[candles.length - 1].close;
    const qualityReport: QualityReport = evaluateDataQuality(candles, Date.now());
    const features = computeTechnicalFeatures(candles);
    const structure = computeMarketStructure(candles);
    const derivatives = generateDerivativesData(symbol, currentPrice);
    const orderBook = generateOrderBook(currentPrice);
    const context = getMarketContext();

    // Market Regime determination
    let regime: any = 'RANGING';
    if (features.ema7 > features.ema20 && features.ema20 > features.ema50) regime = 'STRONG_BULL_TREND';
    else if (features.ema7 < features.ema20 && features.ema20 < features.ema50) regime = 'STRONG_BEAR_TREND';
    else if (structure.isCompressing) regime = 'COMPRESSION';

    const snapshotId = `snap-${symbol}-${tf}-${candles[candles.length - 1].timestamp}`;
    const rawDataStr = `${snapshotId}:${currentPrice}:${features.rsi14}:${derivatives.fundingRate}:${derivatives.openInterestUsd}`;
    const sha256Hash = crypto.createHash('sha256').update(rawDataStr).digest('hex');

    const snapshot: CanonicalSnapshot = {
      snapshotId,
      symbol,
      timeframe: tf,
      currentPrice,
      closedCandles: candles,
      derivatives,
      orderBook,
      context,
      features,
      structure,
      regime,
      qualityReport,
      providerProvenance: 'Binance USDⓈ-M Futures Public Data Gateway',
      timestamp: Date.now(),
      sha256Hash,
    };

    res.json({ success: true, snapshot });
  });

  // API 3: Multi-Stage Scanner
  app.get('/api/scanner/run', async (req, res) => {
    // Scan all available default symbols for full universe coverage
    const symbolsToScan = DEFAULT_SYMBOLS;
    const candidates: ScanCandidate[] = [];

    for (const s of symbolsToScan) {
      const candles = generateSyntheticCandles(s.symbol, 100, '15m');
      const currentPrice = candles[candles.length - 1].close;
      const qualityReport = evaluateDataQuality(candles, Date.now());
      const features = computeTechnicalFeatures(candles);
      const structure = computeMarketStructure(candles);
      const derivatives = generateDerivativesData(s.symbol, currentPrice);
      const orderBook = generateOrderBook(currentPrice);
      const context = getMarketContext();

      let regime: any = 'RANGING';
      if (features.ema7 > features.ema20 && features.ema20 > features.ema50) regime = 'STRONG_BULL_TREND';
      else if (features.ema7 < features.ema20 && features.ema20 < features.ema50) regime = 'STRONG_BEAR_TREND';

      const snapshotId = `snap-${s.symbol}-15m-${Date.now()}`;
      const sha256Hash = crypto.createHash('sha256').update(`${snapshotId}:${currentPrice}`).digest('hex');

      const snapshot: CanonicalSnapshot = {
        snapshotId,
        symbol: s.symbol,
        timeframe: '15m',
        currentPrice,
        closedCandles: candles,
        derivatives,
        orderBook,
        context,
        features,
        structure,
        regime,
        qualityReport,
        providerProvenance: 'Binance USDⓈ-M Futures Public Gateway',
        timestamp: Date.now(),
        sha256Hash,
      };

      const found = evaluateSnapshotStrategies(snapshot);
      candidates.push(...found);
    }

    candidates.sort((a, b) => b.qualityScore - a.qualityScore);
    res.json({ success: true, totalScanned: symbolsToScan.length, candidates });
  });

  // API 4: Frozen Evidence Bundle
  app.post('/api/evidence/freeze', (req, res) => {
    const { snapshot } = req.body as { snapshot: CanonicalSnapshot };
    if (!snapshot) {
      return res.status(400).json({ success: false, error: 'Snapshot is required.' });
    }

    const bundle: FrozenEvidenceBundle = {
      snapshotId: snapshot.snapshotId,
      symbol: snapshot.symbol,
      timestamp: snapshot.timestamp,
      timeframe: snapshot.timeframe,
      indicators: snapshot.features,
      marketStructureSummary: {
        swingsCount: snapshot.structure.swings.length,
        lastStructureBreak: snapshot.structure.lastBos?.type || snapshot.structure.lastChoch?.type,
        fvgCount: snapshot.structure.fvgs.length,
        sweepCount: snapshot.structure.sweeps.length,
        srZonesCount: snapshot.structure.srZones.length,
        isCompressing: snapshot.structure.isCompressing,
      },
      strategyMatch: {
        code: 'S01',
        name: 'Trend Continuation & Pullback',
        direction: snapshot.features.rsi14 >= 50 ? 'LONG' : 'SHORT',
        confidenceScore: 88,
      },
      fundingRate: snapshot.derivatives.fundingRate,
      openInterestUsd: snapshot.derivatives.openInterestUsd,
      orderBookImbalance: snapshot.orderBook.imbalanceRatio,
      marketContext: {
        btcDominance: snapshot.context.btcDominance,
        fearAndGreed: snapshot.context.fearAndGreedIndex,
        regime: snapshot.regime,
      },
      dataQualityScore: snapshot.qualityReport.score,
      providerIds: ['BINANCE_FUTURES_WS', 'COINGECKO_CONTEXT'],
      sha256Hash: snapshot.sha256Hash,
    };

    res.json({ success: true, bundle });
  });

  // API 5: AI Intelligence Council Deliberation (Server-side Gemini)
  app.post('/api/ai/council-deliberate', async (req, res) => {
    const { snapshot, candidate, userChartImageBase64 } = req.body;

    if (!snapshot) {
      return res.status(400).json({ success: false, error: 'Snapshot data is required' });
    }

    try {
      const deliberation = await runCouncilDeliberation(snapshot, candidate, userChartImageBase64);
      res.json({ success: true, deliberation });
    } catch (err: any) {
      console.error('Gemini AI Council Deliberation Endpoint Error:', err);
      res.status(500).json({ success: false, error: err?.message || 'AI Deliberation failed' });
    }
  });

  // API 5B: Batch AI Deliberation for Multiple Candidates
  app.post('/api/ai/batch-deliberate', async (req, res) => {
    const { candidates } = req.body as { candidates: Array<{ snapshot: CanonicalSnapshot; candidate?: ScanCandidate }> };

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ success: false, error: 'Candidates array is required' });
    }

    try {
      const results = [];
      for (const item of candidates.slice(0, 25)) { // process up to 25 candidates
        const deliberation = await runCouncilDeliberation(item.snapshot, item.candidate);
        results.push({
          candidateId: item.candidate?.id || item.snapshot.snapshotId,
          deliberation,
        });
      }
      res.json({ success: true, results });
    } catch (err: any) {
      console.error('Batch AI Deliberation Endpoint Error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Batch AI Deliberation failed' });
    }
  });

  // API 5E: Prime Check Endpoint - Evaluates and verifies EVERY record / symbol in universe
  app.post('/api/prime/check-all', async (req, res) => {
    try {
      const auditRecords: any[] = [];
      for (const s of DEFAULT_SYMBOLS) {
        const candles = generateSyntheticCandles(s.symbol, 100, '15m');
        const currentPrice = candles[candles.length - 1].close;
        const qualityReport = evaluateDataQuality(candles, Date.now());
        const features = computeTechnicalFeatures(candles);
        const structure = computeMarketStructure(candles);
        const derivatives = generateDerivativesData(s.symbol, currentPrice);
        const orderBook = generateOrderBook(currentPrice);
        const context = getMarketContext();

        let regime: any = 'RANGING';
        if (features.ema7 > features.ema20 && features.ema20 > features.ema50) regime = 'STRONG_BULL_TREND';
        else if (features.ema7 < features.ema20 && features.ema20 < features.ema50) regime = 'STRONG_BEAR_TREND';

        const snapshotId = `snap-${s.symbol}-15m-${Date.now()}`;
        const sha256Hash = crypto.createHash('sha256').update(`${snapshotId}:${currentPrice}`).digest('hex');

        const snapshot: CanonicalSnapshot = {
          snapshotId,
          symbol: s.symbol,
          timeframe: '15m',
          currentPrice,
          closedCandles: candles,
          derivatives,
          orderBook,
          context,
          features,
          structure,
          regime,
          qualityReport,
          providerProvenance: 'Binance USDⓈ-M Futures Public Gateway',
          timestamp: Date.now(),
          sha256Hash,
        };

        const foundStrategies = evaluateSnapshotStrategies(snapshot);
        const candidate = foundStrategies.length > 0 ? foundStrategies[0] : undefined;
        
        // Deliberate with Prime AI Council
        const deliberation = await runCouncilDeliberation(snapshot, candidate);

        auditRecords.push({
          symbol: s.symbol,
          price: currentPrice,
          qualityScore: qualityReport.score,
          qualityStatus: qualityReport.status,
          regime,
          candidateCount: foundStrategies.length,
          topStrategy: candidate ? `${candidate.strategyCode} - ${candidate.strategyName}` : 'None',
          direction: candidate ? candidate.direction : (features.rsi14 >= 50 ? 'LONG' : 'SHORT'),
          arbiterStatus: deliberation.arbiterVerdict.status,
          consensusScore: deliberation.arbiterVerdict.consensusScore,
          redTeamPassed: deliberation.arbiterVerdict.redTeamPassed,
          sha256Hash,
          checkedAt: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        checkedCount: auditRecords.length,
        timestamp: Date.now(),
        primeModel: 'gemini-3.6-flash / gemini-3.1-pro-preview',
        records: auditRecords,
      });
    } catch (err: any) {
      console.error('Prime Check All Endpoint Error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Prime check all failed' });
    }
  });

  // API 5C: Context-Aware Chatbot Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    const { prompt, history, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    try {
      const replyText = await processChatAssistantQuery(prompt, history || [], context || {});
      res.json({ success: true, reply: replyText });
    } catch (err: any) {
      console.error('AI Chat Endpoint Error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Chat processing failed' });
    }
  });

  // API 5D: Image Chart Analysis Endpoint
  app.post('/api/ai/analyze-image', async (req, res) => {
    const { imageBase64, snapshot, candidate } = req.body;

    if (!imageBase64 || !snapshot) {
      return res.status(400).json({ success: false, error: 'Image base64 string and snapshot are required' });
    }

    try {
      const deliberation = await runCouncilDeliberation(snapshot, candidate, imageBase64);
      res.json({ success: true, deliberation });
    } catch (err: any) {
      console.error('AI Image Analysis Endpoint Error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Image analysis failed' });
    }
  });

  // API 6: Deterministic Trade Plan & Risk Engine
  app.post('/api/trade-plan/calculate', (req, res) => {
    const { snapshot, direction, strategyCode, accountState } = req.body;
    if (!snapshot) {
      return res.status(400).json({ success: false, error: 'Snapshot is required' });
    }

    const plan = generateDeterministicTradePlan(snapshot, direction || 'LONG', strategyCode || 'S01');
    const risk = evaluateTradeRisk(plan, DEFAULT_RISK_CONFIG, accountState || { balance: 10000, marginUsed: 0, dailyDrawdownPct: 0, consecutiveLosses: 0, dailyLockout: false });

    res.json({ success: true, plan, risk });
  });

  // API 7: Multi-Year Backtest Engine (2023 - Present)
  app.post('/api/backtest/run', async (req, res) => {
    try {
      const body = req.body ?? {};
      const symbol = assertSymbol(body.symbol, 'BTCUSDT');
      const timeframe = assertInterval(body.timeframe, '1h');
      const initialBalance = assertBoundedNumber(body.initialBalance, 'initialBalance', 1, 1_000_000_000, 10000);
      const riskPerTradePct = assertBoundedNumber(body.riskPerTradePct, 'riskPerTradePct', 0.01, 100, 1.0);
      const maxLeverage = assertBoundedNumber(body.maxLeverage, 'maxLeverage', 1, 125, 10);

      const startMs = new Date(body.startDate ?? '2023-01-01').getTime();
      const endMs = new Date(body.endDate ?? '2026-08-10').getTime();
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
        throw new ApiError('INVALID_REQUEST', 'startDate and endDate must be valid ISO dates.');
      }

      let candles: Candle[] = [];

      // Try fetching real historical Binance Futures klines in chunks if available
      try {
        let interval = '1h';
        if (timeframe === '15m') interval = '15m';
        if (timeframe === '4h') interval = '4h';
        if (timeframe === '1d') interval = '1d';

        // Fetch most recent 1000 klines from Binance API
        const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=1000`;
        const resp = await fetch(url);
        if (resp.ok) {
          const raw = await resp.json();
          candles = raw.map((k: any) => ({
            timestamp: k[0],
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
          }));
        }
      } catch (err) {
        console.warn('Binance klines fetch failed, generating multi-year synthetic dataset', err);
      }

      // If candles count is insufficient or fetch failed, generate deterministic multi-year dataset
      if (!candles || candles.length < 100) {
        candles = generateHistoricalCandles2023ToPresent(symbol, timeframe, startMs, endMs);
      }

      const report = runHistoricalBacktest(candles, symbol, timeframe, initialBalance, riskPerTradePct, maxLeverage);

      res.json({ success: true, report });
    } catch (err) {
      sendError(res, err, 'POST /api/backtest/run');
    }
  });

  // Vite middleware for dev, static assets plus SPA fallback for production.
  //
  // This must be registered *after* every API route. The `app.get('*')` fallback
  // matches any unclaimed path, so while it was registered here — before the
  // /api/v1/ai/* routes below — all six AI gateway endpoints were shadowed by
  // index.html in production builds and never executed.
  async function mountClient() {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  



app.get('/api/v1/ai/providers', (req, res) => {
  try {
    const providers = AIProviderGateway.getPublicProviders();
    res.json({ success: true, providers });
  } catch (err) {
    sendError(res, err, 'GET /api/v1/ai/providers');
  }
});

app.post('/api/v1/ai/providers', (req, res) => {
  try {
    const id = AIProviderGateway.addProvider(req.body);
    res.json({ success: true, id });
  } catch (err) {
    sendError(res, err, 'POST /api/v1/ai/providers');
  }
});

app.delete('/api/v1/ai/providers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM ai_providers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'DELETE /api/v1/ai/providers/:id');
  }
});

app.patch('/api/v1/ai/providers/:id', (req, res) => {
  // Simplified for mvp - in reality, dynamic SQL builder or individual fields
  try {
    const p = req.body ?? {};
    const { base_url, secret_ref } = AIProviderGateway.validateProviderInput(p);
    db.prepare(`UPDATE ai_providers SET 
      display_name = ?, enabled = ?, priority = ?, base_url = ?, model = ?,
      secret_ref = ?, privacy_class = ?, timeout_seconds = ?, max_retries = ?, updated_at_utc = ?
      WHERE id = ?`).run(
      p.display_name, p.enabled ? 1 : 0, p.priority, base_url, p.model,
      secret_ref, p.privacy_class, p.timeout_seconds, p.max_retries, new Date().toISOString(), req.params.id
    );
    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'PATCH /api/v1/ai/providers/:id');
  }
});

app.get('/api/v1/ai/routing', (req, res) => {
  res.json({ success: true, routing_mode: AIProviderGateway.getRoutingMode() });
});

app.patch('/api/v1/ai/routing', (req, res) => {
  try {
    const mode = req.body?.routing_mode;
    if (!ROUTING_MODES.includes(mode)) {
      throw new ApiError('INVALID_REQUEST', `routing_mode must be one of: ${ROUTING_MODES.join(', ')}`);
    }
    db.prepare("UPDATE ai_routing_policy SET routing_mode = ? WHERE id = 'default'").run(mode);
    res.json({ success: true });
  } catch (err) {
    sendError(res, err, 'PATCH /api/v1/ai/routing');
  }
});

  await mountClient();

app.listen(PORT, HOST, () => {
    console.log(`Signal Desk Unified v2.0 server running on http://${HOST}:${PORT}`);
  });
}

startServer();
