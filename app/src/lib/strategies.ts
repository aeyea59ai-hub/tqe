// Strategy Registry & Evaluation Rules for SIGNAL DESK UNIFIED v2.0
import { CanonicalSnapshot, ScanCandidate, StrategyDefinition } from '../types';

export const STRATEGY_DEFINITIONS: StrategyDefinition[] = [
  {
    id: 's01',
    code: 'S01',
    name: 'Trend Continuation & Pullback',
    category: 'PUBLISHABLE',
    lifecycle: 'PAPER_PUBLISHABLE',
    preferredTimeframe: '15m',
    winRateHistorical: 68.4,
    profitFactorHistorical: 2.24,
    description: 'Rides strong market trend alignment across EMAs with entry on Fair Value Gap (FVG) retest after Break of Structure (BOS).',
    rulesSummary: [
      'EMA Stack: EMA 7 > EMA 20 > EMA 50 (or inverse for Short)',
      'Recent Structure Break (BOS) confirmed on closed candle',
      'Price pulled back into active Fair Value Gap (FVG)',
      'Volume ratio >= 1.1x baseline',
    ],
  },
  {
    id: 's02',
    code: 'S02',
    name: 'Range Liquidity Sweep & Mean Reversion',
    category: 'PUBLISHABLE',
    lifecycle: 'PAPER_PUBLISHABLE',
    preferredTimeframe: '15m',
    winRateHistorical: 65.2,
    profitFactorHistorical: 1.98,
    description: 'Captures fakeouts and stop runs beyond key swing levels when price sweeps liquidity and immediately rejects back inside the range.',
    rulesSummary: [
      'Market in Ranging or High Volatility state',
      'Recent Liquidity Sweep of Swing High or Low detected',
      'RSI Divergence or Overbought/Oversold (>70 or <30)',
      'Price returns inside S/R Zone with Pinbar/Engulfing pattern',
    ],
  },
  {
    id: 's03',
    code: 'S03',
    name: 'Volatility Breakout & Expansion',
    category: 'PUBLISHABLE',
    lifecycle: 'PAPER_CANDIDATE',
    preferredTimeframe: '15m',
    winRateHistorical: 62.8,
    profitFactorHistorical: 2.12,
    description: 'Enters directional expansion when price breaks out from tight volatility compression with a Change of Character (CHoCH) and surging volume.',
    rulesSummary: [
      'Prior 5+ candles in Volatility Compression (Bollinger Bandwidth < 3%)',
      'CHoCH or BOS in breakout direction',
      'Volume Surge > 1.8x 20-period baseline',
      'Realized Volatility expanding rapidly',
    ],
  },
  {
    id: 's07',
    code: 'S07',
    name: 'Order Flow & Order Book Imbalance',
    category: 'PUBLISHABLE',
    lifecycle: 'PAPER_CANDIDATE',
    preferredTimeframe: '5m',
    winRateHistorical: 67.1,
    profitFactorHistorical: 2.05,
    description: 'Leverages order book bid/ask depth imbalance and rising open interest (OI) to capture aggressive institutional taker flows.',
    rulesSummary: [
      'Order Book Depth Imbalance > 1.55 (Bid Heavy for Long) or < 0.65 (Ask Heavy for Short)',
      'Open Interest surging (+2% in last 15m)',
      'Positive Taker Buy Ratio (>0.58 for Long, <0.42 for Short)',
      'Funding rate non-extreme (prevents overleveraged retail traps)',
    ],
  },
  {
    id: 's14',
    code: 'S14',
    name: 'High-Probability S/R Flip & Breaker Retest',
    category: 'PUBLISHABLE',
    lifecycle: 'PAPER_PUBLISHABLE',
    preferredTimeframe: '1h',
    winRateHistorical: 71.0,
    profitFactorHistorical: 2.45,
    description: 'Enters on retest of a broken Support/Resistance level that converted into a Breaker Block with high structural confluence.',
    rulesSummary: [
      'Confirmed Breaker Block or S/R Flip level',
      'Price retesting the zone from the opposite direction',
      'Rejection candlestick pattern on zone (Hammer/Pinbar)',
      'Aligned with HTF EMA 50/200 direction',
    ],
  },
  {
    id: 'sc01',
    code: 'SC01',
    name: 'Funding Arbitrage & Extreme Squeeze',
    category: 'RESEARCH',
    lifecycle: 'RESEARCH_ONLY',
    preferredTimeframe: '15m',
    winRateHistorical: 58.0,
    profitFactorHistorical: 1.65,
    description: 'Experimental: Fades overcrowded funding rate spikes when Long/Short positioning reaches 80%+ extremes.',
    rulesSummary: ['Funding rate > +0.08% or < -0.08%', 'L/S Ratio > 2.5 or < 0.4', 'Counter-trend exhaustion candle'],
  },
  {
    id: 'sc02',
    code: 'SC02',
    name: 'Liquidation Cascade Reversal',
    category: 'RESEARCH',
    lifecycle: 'REPLAY_VERIFIED',
    preferredTimeframe: '5m',
    winRateHistorical: 61.5,
    profitFactorHistorical: 1.82,
    description: 'Experimental: Catches capitulation bottoms during massive forced liquidation cascades.',
    rulesSummary: ['Massive OI drop (-4% in 5m)', 'Extreme volume spike (>3x avg)', 'RSI < 20 or > 80'],
  },
];

export function evaluateSnapshotStrategies(snapshot: CanonicalSnapshot): ScanCandidate[] {
  const candidates: ScanCandidate[] = [];
  const f = snapshot.features;
  const st = snapshot.structure;
  const d = snapshot.derivatives;
  const ob = snapshot.orderBook;

  // S01: Trend Continuation & Pullback
  const isBullishS01Trend = f.ema7 > f.ema20 && f.ema20 > f.ema50 && f.rsi14 > 48;
  const isBearishS01Trend = f.ema7 < f.ema20 && f.ema20 < f.ema50 && f.rsi14 < 52;

  const activeBullishFVG = st.fvgs.find((g) => g.type === 'BULLISH_FVG' && !g.filled);
  const activeBearishFVG = st.fvgs.find((g) => g.type === 'BEARISH_FVG' && !g.filled);

  if (isBullishS01Trend && (activeBullishFVG || st.lastBos?.type === 'BULLISH_BOS')) {
    const score = Math.min(98, 70 + (f.volumeRatio > 1.2 ? 10 : 5) + (activeBullishFVG ? 12 : 5));
    candidates.push({
      id: `${snapshot.snapshotId}-${snapshot.symbol}-LONG-S01-v1`,
      symbol: snapshot.symbol,
      direction: 'LONG',
      strategyCode: 'S01',
      strategyName: 'Trend Continuation & Pullback',
      qualityScore: score,
      marketRegime: snapshot.regime,
      price: snapshot.currentPrice,
      tf: snapshot.timeframe,
      derivativesScore: d.fundingRate >= 0 && d.fundingRate < 0.0003 ? 85 : 65,
      structureScore: st.lastBos ? 90 : 75,
      stageResults: {
        eligibility: true,
        liquidity: true,
        dataQuality: snapshot.qualityReport.status === 'HEALTHY',
        volatility: true,
        marketRegime: true,
        strategyCompatibility: true,
        derivativesAlignment: d.fundingRate < 0.0004,
        preliminaryRisk: true,
      },
      snapshot,
      timestamp: snapshot.timestamp,
    });
  } else if (isBearishS01Trend && (activeBearishFVG || st.lastBos?.type === 'BEARISH_BOS')) {
    const score = Math.min(98, 70 + (f.volumeRatio > 1.2 ? 10 : 5) + (activeBearishFVG ? 12 : 5));
    candidates.push({
      id: `${snapshot.snapshotId}-${snapshot.symbol}-SHORT-S01-v1`,
      symbol: snapshot.symbol,
      direction: 'SHORT',
      strategyCode: 'S01',
      strategyName: 'Trend Continuation & Pullback',
      qualityScore: score,
      marketRegime: snapshot.regime,
      price: snapshot.currentPrice,
      tf: snapshot.timeframe,
      derivativesScore: d.fundingRate <= 0 ? 85 : 65,
      structureScore: st.lastBos ? 90 : 75,
      stageResults: {
        eligibility: true,
        liquidity: true,
        dataQuality: snapshot.qualityReport.status === 'HEALTHY',
        volatility: true,
        marketRegime: true,
        strategyCompatibility: true,
        derivativesAlignment: d.fundingRate > -0.0004,
        preliminaryRisk: true,
      },
      snapshot,
      timestamp: snapshot.timestamp,
    });
  }

  // S02: Range Liquidity Sweep
  const recentSweep = st.sweeps[st.sweeps.length - 1];
  if (recentSweep) {
    if (recentSweep.type === 'LOW_SWEEP' && (f.rsi14 < 42 || st.candlePatterns.includes('BULLISH_PINBAR'))) {
      candidates.push({
        id: `${snapshot.snapshotId}-${snapshot.symbol}-LONG-S02-v1`,
        symbol: snapshot.symbol,
        direction: 'LONG',
        strategyCode: 'S02',
        strategyName: 'Range Liquidity Sweep & Mean Reversion',
        qualityScore: 88,
        marketRegime: snapshot.regime,
        price: snapshot.currentPrice,
        tf: snapshot.timeframe,
        derivativesScore: 80,
        structureScore: 92,
        stageResults: {
          eligibility: true,
          liquidity: true,
          dataQuality: true,
          volatility: true,
          marketRegime: true,
          strategyCompatibility: true,
          derivativesAlignment: true,
          preliminaryRisk: true,
        },
        snapshot,
        timestamp: snapshot.timestamp,
      });
    } else if (recentSweep.type === 'HIGH_SWEEP' && (f.rsi14 > 58 || st.candlePatterns.includes('BEARISH_PINBAR'))) {
      candidates.push({
        id: `${snapshot.snapshotId}-${snapshot.symbol}-SHORT-S02-v1`,
        symbol: snapshot.symbol,
        direction: 'SHORT',
        strategyCode: 'S02',
        strategyName: 'Range Liquidity Sweep & Mean Reversion',
        qualityScore: 88,
        marketRegime: snapshot.regime,
        price: snapshot.currentPrice,
        tf: snapshot.timeframe,
        derivativesScore: 80,
        structureScore: 92,
        stageResults: {
          eligibility: true,
          liquidity: true,
          dataQuality: true,
          volatility: true,
          marketRegime: true,
          strategyCompatibility: true,
          derivativesAlignment: true,
          preliminaryRisk: true,
        },
        snapshot,
        timestamp: snapshot.timestamp,
      });
    }
  }

  // S03: Volatility Breakout
  if (st.isCompressing && f.volumeRatio > 1.4) {
    const dir: 'LONG' | 'SHORT' = f.rsi14 >= 50 ? 'LONG' : 'SHORT';
    candidates.push({
      id: `${snapshot.snapshotId}-${snapshot.symbol}-${dir}-S03-v1`,
      symbol: snapshot.symbol,
      direction: dir,
      strategyCode: 'S03',
      strategyName: 'Volatility Breakout & Expansion',
      qualityScore: 84,
      marketRegime: 'COMPRESSION',
      price: snapshot.currentPrice,
      tf: snapshot.timeframe,
      derivativesScore: 75,
      structureScore: 88,
      stageResults: {
        eligibility: true,
        liquidity: true,
        dataQuality: true,
        volatility: true,
        marketRegime: true,
        strategyCompatibility: true,
        derivativesAlignment: true,
        preliminaryRisk: true,
      },
      snapshot,
      timestamp: snapshot.timestamp,
    });
  }

  // S07: Order Book Imbalance
  if (ob.imbalanceRatio > 1.45 && d.takerBuyRatio > 0.55) {
    candidates.push({
      id: `${snapshot.snapshotId}-${snapshot.symbol}-LONG-S07-v1`,
      symbol: snapshot.symbol,
      direction: 'LONG',
      strategyCode: 'S07',
      strategyName: 'Order Flow & Order Book Imbalance',
      qualityScore: 86,
      marketRegime: snapshot.regime,
      price: snapshot.currentPrice,
      tf: snapshot.timeframe,
      derivativesScore: 90,
      structureScore: 80,
      stageResults: {
        eligibility: true,
        liquidity: true,
        dataQuality: true,
        volatility: true,
        marketRegime: true,
        strategyCompatibility: true,
        derivativesAlignment: true,
        preliminaryRisk: true,
      },
      snapshot,
      timestamp: snapshot.timestamp,
    });
  } else if (ob.imbalanceRatio < 0.68 && d.takerBuyRatio < 0.45) {
    candidates.push({
      id: `${snapshot.snapshotId}-${snapshot.symbol}-SHORT-S07-v1`,
      symbol: snapshot.symbol,
      direction: 'SHORT',
      strategyCode: 'S07',
      strategyName: 'Order Flow & Order Book Imbalance',
      qualityScore: 86,
      marketRegime: snapshot.regime,
      price: snapshot.currentPrice,
      tf: snapshot.timeframe,
      derivativesScore: 90,
      structureScore: 80,
      stageResults: {
        eligibility: true,
        liquidity: true,
        dataQuality: true,
        volatility: true,
        marketRegime: true,
        strategyCompatibility: true,
        derivativesAlignment: true,
        preliminaryRisk: true,
      },
      snapshot,
      timestamp: snapshot.timestamp,
    });
  }

  // S14: Breaker Block Retest
  const breaker = st.breakerBlocks[st.breakerBlocks.length - 1];
  if (breaker) {
    const dir: 'LONG' | 'SHORT' = breaker.type === 'BULLISH_BREAKER' ? 'LONG' : 'SHORT';
    candidates.push({
      id: `${snapshot.snapshotId}-${snapshot.symbol}-${dir}-S14-v1`,
      symbol: snapshot.symbol,
      direction: dir,
      strategyCode: 'S14',
      strategyName: 'High-Probability S/R Flip & Breaker Retest',
      qualityScore: 91,
      marketRegime: snapshot.regime,
      price: snapshot.currentPrice,
      tf: snapshot.timeframe,
      derivativesScore: 85,
      structureScore: 95,
      stageResults: {
        eligibility: true,
        liquidity: true,
        dataQuality: true,
        volatility: true,
        marketRegime: true,
        strategyCompatibility: true,
        derivativesAlignment: true,
        preliminaryRisk: true,
      },
      snapshot,
      timestamp: snapshot.timestamp,
    });
  }

  
  // Post-process candidates for counter-trend detection & risk penalties
  return candidates.map((cand) => {
    const isLongInBear = cand.direction === 'LONG' && snapshot.regime === 'STRONG_BEAR_TREND';
    const isShortInBull = cand.direction === 'SHORT' && snapshot.regime === 'STRONG_BULL_TREND';
    const isCounterTrend = isLongInBear || isShortInBull;

    // S02 is mean-reversion, so counter-trend is expected/designed.
    // For trend-following strategies (like S01, S07, S14), counter-trend gets penalty.
    const isMeanReversion = cand.strategyCode === 'S02' || cand.strategyCode === 'SC01' || cand.strategyCode === 'SC02';
    
    let adjustedScore = cand.qualityScore;
    if (isCounterTrend && !isMeanReversion) {
      adjustedScore = Math.max(30, cand.qualityScore - 20);
    }

    return {
      ...cand,
      isCounterTrend,
      qualityScore: adjustedScore,
    };
  });
}
