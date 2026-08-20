// Market Structure Engine for SIGNAL DESK UNIFIED v2.0
import { BreakerBlock, Candle, FairValueGap, LiquiditySweep, MarketStructure, SRZone, StructureBreak, SwingPoint } from '../types';

export function detectSwings(candles: Candle[], lookback = 3): SwingPoint[] {
  const swings: SwingPoint[] = [];
  if (candles.length < lookback * 2 + 1) return swings;

  for (let i = lookback; i < candles.length - lookback; i++) {
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;

    let isHigh = true;
    let isLow = true;

    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue;
      if (candles[j].high >= currentHigh) isHigh = false;
      if (candles[j].low <= currentLow) isLow = false;
    }

    if (isHigh) {
      const prevHigh = swings.filter((s) => s.type === 'HH' || s.type === 'LH').pop();
      let type: 'HH' | 'LH' = 'HH';
      if (prevHigh && currentHigh < prevHigh.price) {
        type = 'LH';
      }
      swings.push({
        price: currentHigh,
        timestamp: candles[i].timestamp,
        index: i,
        type,
      });
    } else if (isLow) {
      const prevLow = swings.filter((s) => s.type === 'HL' || s.type === 'LL').pop();
      let type: 'HL' | 'LL' = 'HL';
      if (prevLow && currentLow < prevLow.price) {
        type = 'LL';
      }
      swings.push({
        price: currentLow,
        timestamp: candles[i].timestamp,
        index: i,
        type,
      });
    }
  }

  return swings;
}

export function detectStructureBreaks(candles: Candle[], swings: SwingPoint[]): { lastBos?: StructureBreak; lastChoch?: StructureBreak } {
  let lastBos: StructureBreak | undefined;
  let lastChoch: StructureBreak | undefined;

  if (candles.length === 0 || swings.length < 2) return { lastBos, lastChoch };

  const lastClose = candles[candles.length - 1].close;

  // Check recent swing highs and lows
  const highSwings = swings.filter((s) => s.type === 'HH' || s.type === 'LH');
  const lowSwings = swings.filter((s) => s.type === 'HL' || s.type === 'LL');

  const recentHigh = highSwings[highSwings.length - 1];
  const recentLow = lowSwings[lowSwings.length - 1];

  if (recentHigh && lastClose > recentHigh.price) {
    lastBos = {
      price: recentHigh.price,
      timestamp: candles[candles.length - 1].timestamp,
      type: 'BULLISH_BOS',
    };
  } else if (recentLow && lastClose < recentLow.price) {
    lastBos = {
      price: recentLow.price,
      timestamp: candles[candles.length - 1].timestamp,
      type: 'BEARISH_BOS',
    };
  }

  // CHoCH detection: breaking prior swing high in downtrend or prior swing low in uptrend
  if (highSwings.length >= 2 && lowSwings.length >= 2) {
    if (recentHigh && recentHigh.type === 'LH' && lastClose > recentHigh.price) {
      lastChoch = {
        price: recentHigh.price,
        timestamp: candles[candles.length - 1].timestamp,
        type: 'BULLISH_CHOCH',
      };
    } else if (recentLow && recentLow.type === 'HL' && lastClose < recentLow.price) {
      lastChoch = {
        price: recentLow.price,
        timestamp: candles[candles.length - 1].timestamp,
        type: 'BEARISH_CHOCH',
      };
    }
  }

  return { lastBos, lastChoch };
}

export function detectSRZones(candles: Candle[], swings: SwingPoint[]): SRZone[] {
  const zones: SRZone[] = [];
  if (candles.length === 0) return zones;

  const currentPrice = candles[candles.length - 1].close;
  const priceThreshold = currentPrice * 0.005; // 0.5% cluster threshold

  // Group swings by price clusters
  const clusters: { price: number; type: 'SUPPORT' | 'RESISTANCE'; count: number }[] = [];

  for (const s of swings) {
    const type: 'SUPPORT' | 'RESISTANCE' = s.type === 'HL' || s.type === 'LL' ? 'SUPPORT' : 'RESISTANCE';
    const existing = clusters.find((c) => Math.abs(c.price - s.price) <= priceThreshold && c.type === type);
    if (existing) {
      existing.price = (existing.price * existing.count + s.price) / (existing.count + 1);
      existing.count += 1;
    } else {
      clusters.push({ price: s.price, type, count: 1 });
    }
  }

  clusters.forEach((c, idx) => {
    zones.push({
      id: `sr-${idx}`,
      priceMin: c.price - priceThreshold / 2,
      priceMax: c.price + priceThreshold / 2,
      strength: Math.min(5, c.count + 1),
      type: c.type,
      touches: c.count,
    });
  });

  return zones.slice(-6); // Keep top 6
}

export function detectFVGs(candles: Candle[]): FairValueGap[] {
  const fvgs: FairValueGap[] = [];
  if (candles.length < 3) return fvgs;

  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 2];
    const c3 = candles[i];

    // Bullish FVG: Low of candle 3 is higher than High of candle 1
    if (c3.low > c1.high) {
      const top = c3.low;
      const bottom = c1.high;
      // Check if subsequent candles filled it
      let filled = false;
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].low <= bottom) {
          filled = true;
          break;
        }
      }
      fvgs.push({
        id: `fvg-${i}`,
        top,
        bottom,
        type: 'BULLISH_FVG',
        timestamp: candles[i - 1].timestamp,
        filled,
      });
    }
    // Bearish FVG: High of candle 3 is lower than Low of candle 1
    else if (c3.high < c1.low) {
      const top = c1.low;
      const bottom = c3.high;
      let filled = false;
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].high >= top) {
          filled = true;
          break;
        }
      }
      fvgs.push({
        id: `fvg-${i}`,
        top,
        bottom,
        type: 'BEARISH_FVG',
        timestamp: candles[i - 1].timestamp,
        filled,
      });
    }
  }

  return fvgs.slice(-8);
}

export function detectLiquiditySweeps(candles: Candle[], swings: SwingPoint[]): LiquiditySweep[] {
  const sweeps: LiquiditySweep[] = [];
  if (candles.length === 0 || swings.length === 0) return sweeps;

  const recentCandles = candles.slice(-10);

  for (const c of recentCandles) {
    for (const s of swings) {
      if (c.timestamp <= s.timestamp) continue;
      // High sweep: wick went above swing high, but close was below swing high
      if (s.type === 'HH' || s.type === 'LH') {
        if (c.high > s.price && c.close < s.price) {
          sweeps.push({
            id: `sweep-${c.timestamp}`,
            price: c.high,
            sweptLevel: s.price,
            type: 'HIGH_SWEEP',
            timestamp: c.timestamp,
          });
        }
      }
      // Low sweep: wick went below swing low, but close was above swing low
      if (s.type === 'HL' || s.type === 'LL') {
        if (c.low < s.price && c.close > s.price) {
          sweeps.push({
            id: `sweep-${c.timestamp}`,
            price: c.low,
            sweptLevel: s.price,
            type: 'LOW_SWEEP',
            timestamp: c.timestamp,
          });
        }
      }
    }
  }

  return sweeps.slice(-5);
}

export function detectBreakerBlocks(candles: Candle[], swings: SwingPoint[]): BreakerBlock[] {
  const breakers: BreakerBlock[] = [];
  if (candles.length < 5) return breakers;

  // Simplify: failed swing high/low that got broken through violently
  const recentSwings = swings.slice(-4);
  const lastClose = candles[candles.length - 1].close;

  for (const s of recentSwings) {
    if ((s.type === 'LH' || s.type === 'HH') && lastClose > s.price) {
      breakers.push({
        id: `breaker-${s.timestamp}`,
        top: s.price * 1.002,
        bottom: s.price * 0.998,
        type: 'BULLISH_BREAKER',
        timestamp: s.timestamp,
      });
    } else if ((s.type === 'HL' || s.type === 'LL') && lastClose < s.price) {
      breakers.push({
        id: `breaker-${s.timestamp}`,
        top: s.price * 1.002,
        bottom: s.price * 0.998,
        type: 'BEARISH_BREAKER',
        timestamp: s.timestamp,
      });
    }
  }

  return breakers.slice(-4);
}

export function detectCandlePatterns(candles: Candle[]): string[] {
  const patterns: string[] = [];
  if (candles.length < 2) return patterns;

  const c1 = candles[candles.length - 2];
  const c2 = candles[candles.length - 1];

  const c2Body = Math.abs(c2.close - c2.open);
  const c2Range = c2.high - c2.low;
  const c1Body = Math.abs(c1.close - c1.open);

  // Bullish Engulfing
  if (c1.close < c1.open && c2.close > c2.open && c2.close > c1.open && c2.open < c1.close) {
    patterns.push('BULLISH_ENGULFING');
  }
  // Bearish Engulfing
  if (c1.close > c1.open && c2.close < c2.open && c2.close < c1.open && c2.open > c1.close) {
    patterns.push('BEARISH_ENGULFING');
  }
  // Pinbar / Hammer
  const c2LowerWick = Math.min(c2.open, c2.close) - c2.low;
  const c2UpperWick = c2.high - Math.max(c2.open, c2.close);
  if (c2LowerWick > c2Body * 2 && c2UpperWick < c2Body) {
    patterns.push('BULLISH_PINBAR');
  }
  if (c2UpperWick > c2Body * 2 && c2LowerWick < c2Body) {
    patterns.push('BEARISH_PINBAR');
  }
  // Inside Bar
  if (c2.high < c1.high && c2.low > c1.low) {
    patterns.push('INSIDE_BAR');
  }

  return patterns;
}

export function computeMarketStructure(candles: Candle[]): MarketStructure {
  if (!candles || candles.length === 0) {
    return {
      swings: [],
      srZones: [],
      fvgs: [],
      sweeps: [],
      breakerBlocks: [],
      isRanging: false,
      isCompressing: false,
      candlePatterns: [],
    };
  }

  const swings = detectSwings(candles, 3);
  const { lastBos, lastChoch } = detectStructureBreaks(candles, swings);
  const srZones = detectSRZones(candles, swings);
  const fvgs = detectFVGs(candles);
  const sweeps = detectLiquiditySweeps(candles, swings);
  const breakerBlocks = detectBreakerBlocks(candles, swings);
  const candlePatterns = detectCandlePatterns(candles);

  // Range detection
  const recentCloses = candles.slice(-20).map((c) => c.close);
  const maxClose = Math.max(...recentCloses);
  const minClose = Math.min(...recentCloses);
  const avgClose = (maxClose + minClose) / 2;
  const rangePct = (maxClose - minClose) / avgClose;
  const isRanging = rangePct < 0.025; // less than 2.5% variation in 20 bars

  // Compression detection (shrinking high-low ranges)
  const ranges = candles.slice(-6).map((c) => c.high - c.low);
  let isCompressing = true;
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i] > ranges[i - 1] * 1.05) {
      isCompressing = false;
      break;
    }
  }

  return {
    swings,
    lastBos,
    lastChoch,
    srZones,
    fvgs,
    sweeps,
    breakerBlocks,
    isRanging,
    rangeBounds: isRanging ? { low: minClose, high: maxClose, mid: avgClose } : undefined,
    isCompressing,
    candlePatterns,
  };
}
