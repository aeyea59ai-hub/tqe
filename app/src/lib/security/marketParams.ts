/**
 * Boundary validation for upstream market-data parameters.
 *
 * `symbol` and `interval` are interpolated into upstream Binance URLs. They must
 * be constrained to a known-safe grammar before that happens, so a request
 * cannot inject additional query parameters or path segments.
 */

export class MarketParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarketParamError';
  }
}

/** Binance USD-M futures symbols are uppercase alphanumerics, e.g. BTCUSDT. */
const SYMBOL_PATTERN = /^[A-Z0-9]{2,20}$/;

/** The exact interval set exposed by the product. */
export const SUPPORTED_INTERVALS = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
] as const;

export type SupportedInterval = (typeof SUPPORTED_INTERVALS)[number];

const INTERVAL_SET: ReadonlySet<string> = new Set(SUPPORTED_INTERVALS);

export function isValidSymbol(value: unknown): value is string {
  return typeof value === 'string' && SYMBOL_PATTERN.test(value);
}

export function isValidInterval(value: unknown): value is SupportedInterval {
  return typeof value === 'string' && INTERVAL_SET.has(value);
}

/** Normalises and validates a symbol, or throws `MarketParamError`. */
export function assertSymbol(value: unknown, fallback?: string): string {
  const candidate = value === undefined || value === null || value === '' ? fallback : value;
  if (typeof candidate !== 'string') {
    throw new MarketParamError('symbol is required.');
  }
  const normalized = candidate.trim().toUpperCase();
  if (!isValidSymbol(normalized)) {
    throw new MarketParamError('symbol must be 2-20 uppercase alphanumeric characters, e.g. BTCUSDT.');
  }
  return normalized;
}

/** Normalises and validates a timeframe, or throws `MarketParamError`. */
export function assertInterval(value: unknown, fallback?: string): SupportedInterval {
  const candidate = value === undefined || value === null || value === '' ? fallback : value;
  if (typeof candidate !== 'string') {
    throw new MarketParamError('interval is required.');
  }
  const normalized = candidate.trim().toLowerCase();
  if (!isValidInterval(normalized)) {
    throw new MarketParamError(
      `interval must be one of: ${SUPPORTED_INTERVALS.join(', ')}.`,
    );
  }
  return normalized;
}

/** Validates a bounded positive integer, used for `limit`-style parameters. */
export function assertBoundedInt(value: unknown, name: string, min: number, max: number, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new MarketParamError(`${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

/** Validates a bounded finite number, used for risk and sizing parameters. */
export function assertBoundedNumber(value: unknown, name: string, min: number, max: number, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new MarketParamError(`${name} must be a number between ${min} and ${max}.`);
  }
  return parsed;
}
