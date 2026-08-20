// Provider & Data Quality Gate for SIGNAL DESK UNIFIED v2.0
import { Candle, QualityReport } from '../types';

export function evaluateDataQuality(candles: Candle[], receivedTimeMs: number): QualityReport {
  const warnings: string[] = [];
  let score = 100;

  if (!candles || candles.length === 0) {
    return {
      status: 'BLOCKED',
      score: 0,
      freshnessMs: 999999,
      latencyMs: 999999,
      missingCandles: 99,
      schemaValid: false,
      timestampValid: false,
      continuityValid: false,
      providerAgreed: false,
      rejectionReason: 'Empty candle dataset received from data provider.',
      warnings: ['No candle data available.'],
    };
  }

  const now = Date.now();
  const lastCandle = candles[candles.length - 1];

  // 1. Schema Validation
  let schemaValid = true;
  for (const c of candles) {
    if (
      typeof c.timestamp !== 'number' ||
      typeof c.open !== 'number' ||
      typeof c.high !== 'number' ||
      typeof c.low !== 'number' ||
      typeof c.close !== 'number' ||
      typeof c.volume !== 'number' ||
      c.high < c.low ||
      c.high < c.open ||
      c.high < c.close ||
      c.low > c.open ||
      c.low > c.close
    ) {
      schemaValid = false;
      score -= 30;
      warnings.push('Schema validation failed for one or more candles.');
      break;
    }
  }

  // 2. Future Timestamp Rejection
  let timestampValid = true;
  if (lastCandle.timestamp > now + 60000) {
    timestampValid = false;
    score -= 40;
    warnings.push('Candle timestamp in the future rejected.');
  }

  // 3. Freshness / Latency
  const freshnessMs = Math.max(0, now - lastCandle.timestamp);
  const latencyMs = Math.max(0, now - receivedTimeMs);

  if (freshnessMs > 1000 * 60 * 30) {
    // older than 30 mins
    score -= 25;
    warnings.push(`Data stale by ${Math.round(freshnessMs / 1000 / 60)} minutes.`);
  }

  // 4. Candle Continuity
  let continuityValid = true;
  let missingCandles = 0;
  if (candles.length >= 2) {
    const expectedInterval = candles[1].timestamp - candles[0].timestamp;
    for (let i = 2; i < candles.length; i++) {
      const diff = candles[i].timestamp - candles[i - 1].timestamp;
      if (Math.abs(diff - expectedInterval) > expectedInterval * 0.1) {
        continuityValid = false;
        missingCandles += Math.round(diff / expectedInterval) - 1;
      }
    }
    if (!continuityValid) {
      score -= Math.min(20, missingCandles * 5);
      warnings.push(`Detected ${missingCandles} missing candles in sequence.`);
    }
  }

  // Determine Quality Gate Status
  let status: 'HEALTHY' | 'DEGRADED' | 'INSUFFICIENT' | 'BLOCKED' = 'HEALTHY';
  if (!schemaValid || !timestampValid || score < 40) {
    status = 'BLOCKED';
  } else if (score < 65) {
    status = 'INSUFFICIENT';
  } else if (score < 88 || warnings.length > 0) {
    status = 'DEGRADED';
  }

  return {
    status,
    score: Math.max(0, Math.min(100, score)),
    freshnessMs,
    latencyMs,
    missingCandles,
    schemaValid,
    timestampValid,
    continuityValid,
    providerAgreed: true,
    warnings,
  };
}
