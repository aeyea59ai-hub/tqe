// Technical Indicators Engine for SIGNAL DESK UNIFIED v2.0
import { Candle, TechnicalFeatures } from '../types';

export function calculateEMA(closes: number[], period: number): number[] {
  if (closes.length === 0) return [];
  const k = 2 / (period + 1);
  const emas: number[] = new Array(closes.length);
  
  // First EMA value is SMA
  let sum = 0;
  const initialPeriod = Math.min(period, closes.length);
  for (let i = 0; i < initialPeriod; i++) {
    sum += closes[i];
  }
  let prevEma = sum / initialPeriod;
  for (let i = 0; i < initialPeriod; i++) {
    emas[i] = prevEma;
  }

  for (let i = initialPeriod; i < closes.length; i++) {
    const currentEma = closes[i] * k + prevEma * (1 - k);
    emas[i] = currentEma;
    prevEma = currentEma;
  }
  return emas;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = new Array(closes.length).fill(50);
  if (closes.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}

export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEma = calculateEMA(closes, fastPeriod);
  const slowEma = calculateEMA(closes, slowPeriod);
  
  const macdLine: number[] = new Array(closes.length).fill(0);
  for (let i = 0; i < closes.length; i++) {
    macdLine[i] = fastEma[i] - slowEma[i];
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = new Array(closes.length).fill(0);

  for (let i = 0; i < closes.length; i++) {
    histogram[i] = macdLine[i] - signalLine[i];
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateATR(candles: Candle[], period = 14): number[] {
  const trs: number[] = new Array(candles.length).fill(0);
  if (candles.length === 0) return trs;

  trs[0] = candles[0].high - candles[0].low;
  for (let i = 1; i < candles.length; i++) {
    const tr1 = candles[i].high - candles[i].low;
    const tr2 = Math.abs(candles[i].high - candles[i - 1].close);
    const tr3 = Math.abs(candles[i].low - candles[i - 1].close);
    trs[i] = Math.max(tr1, tr2, tr3);
  }

  const atrs: number[] = new Array(candles.length).fill(0);
  let sum = 0;
  const initP = Math.min(period, candles.length);
  for (let i = 0; i < initP; i++) {
    sum += trs[i];
  }
  let prevAtr = sum / initP;
  for (let i = 0; i < initP; i++) atrs[i] = prevAtr;

  for (let i = initP; i < candles.length; i++) {
    const currentAtr = (prevAtr * (period - 1) + trs[i]) / period;
    atrs[i] = currentAtr;
    prevAtr = currentAtr;
  }

  return atrs;
}

export function calculateVWAP(candles: Candle[]): number[] {
  const vwap: number[] = new Array(candles.length).fill(0);
  let cumulativeTPV = 0;
  let cumulativeVol = 0;

  for (let i = 0; i < candles.length; i++) {
    const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
    cumulativeTPV += typicalPrice * candles[i].volume;
    cumulativeVol += candles[i].volume;
    vwap[i] = cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : typicalPrice;
  }

  return vwap;
}

export function calculateBollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2
): { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[] } {
  const middle = calculateEMA(closes, period); // or SMA
  const upper: number[] = new Array(closes.length).fill(0);
  const lower: number[] = new Array(closes.length).fill(0);
  const bandwidth: number[] = new Array(closes.length).fill(0);

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper[i] = closes[i];
      lower[i] = closes[i];
      bandwidth[i] = 0;
      continue;
    }

    let sumSq = 0;
    const avg = middle[i];
    for (let j = i - period + 1; j <= i; j++) {
      sumSq += Math.pow(closes[j] - avg, 2);
    }
    const stdDev = Math.sqrt(sumSq / period);
    upper[i] = avg + stdDev * multiplier;
    lower[i] = avg - stdDev * multiplier;
    bandwidth[i] = avg > 0 ? (upper[i] - lower[i]) / avg : 0;
  }

  return { upper, middle, lower, bandwidth };
}

export function computeTechnicalFeatures(candles: Candle[]): TechnicalFeatures {
  if (!candles || candles.length === 0) {
    return {
      ema7: 0, ema9: 0, ema20: 0, ema21: 0, ema25: 0, ema50: 0, ema99: 0, ema200: 0,
      rsi14: 50,
      macd: { macd: 0, signal: 0, histogram: 0 },
      atr14: 0,
      vwap: 0,
      bollinger: { upper: 0, middle: 0, lower: 0, bandwidth: 0 },
      volumeBaseline20: 0,
      volumeRatio: 1,
      realizedVolatility: 0,
    };
  }

  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const n = candles.length;
  const lastIndex = n - 1;

  const ema7s = calculateEMA(closes, 7);
  const ema9s = calculateEMA(closes, 9);
  const ema20s = calculateEMA(closes, 20);
  const ema21s = calculateEMA(closes, 21);
  const ema25s = calculateEMA(closes, 25);
  const ema50s = calculateEMA(closes, 50);
  const ema99s = calculateEMA(closes, 99);
  const ema200s = calculateEMA(closes, 200);

  const rsis = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, 12, 26, 9);
  const atrs = calculateATR(candles, 14);
  const vwaps = calculateVWAP(candles);
  const bb = calculateBollingerBands(closes, 20, 2);

  // Volume SMA 20
  let volSum = 0;
  const volP = Math.min(20, n);
  for (let i = n - volP; i < n; i++) volSum += volumes[i];
  const volumeBaseline20 = volSum / volP;
  const volumeRatio = volumeBaseline20 > 0 ? volumes[lastIndex] / volumeBaseline20 : 1;

  // Realized Volatility (std dev of log returns)
  let sumReturns = 0;
  const returns: number[] = [];
  const rvPeriod = Math.min(20, n - 1);
  for (let i = n - rvPeriod; i < n; i++) {
    const r = Math.log(closes[i] / closes[i - 1]);
    returns.push(r);
    sumReturns += r;
  }
  const avgReturn = sumReturns / (returns.length || 1);
  let sqDiff = 0;
  for (const r of returns) {
    sqDiff += Math.pow(r - avgReturn, 2);
  }
  const realizedVolatility = Math.sqrt(sqDiff / (returns.length || 1)) * Math.sqrt(365 * 24); // Annualized pct approx

  return {
    ema7: ema7s[lastIndex],
    ema9: ema9s[lastIndex],
    ema20: ema20s[lastIndex],
    ema21: ema21s[lastIndex],
    ema25: ema25s[lastIndex],
    ema50: ema50s[lastIndex],
    ema99: ema99s[lastIndex],
    ema200: ema200s[lastIndex],
    rsi14: rsis[lastIndex],
    macd: {
      macd: macd.macd[lastIndex],
      signal: macd.signal[lastIndex],
      histogram: macd.histogram[lastIndex],
    },
    atr14: atrs[lastIndex],
    vwap: vwaps[lastIndex],
    bollinger: {
      upper: bb.upper[lastIndex],
      middle: bb.middle[lastIndex],
      lower: bb.lower[lastIndex],
      bandwidth: bb.bandwidth[lastIndex],
    },
    volumeBaseline20,
    volumeRatio,
    realizedVolatility,
  };
}
