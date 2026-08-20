import { describe, expect, it } from 'vitest';
import { parseBinanceBookTickerMessage } from '../src/lib/binanceBookTicker';

describe('parseBinanceBookTickerMessage', () => {
  const sample = {
    e: 'bookTicker',
    u: 400900217,
    E: 1568014460893,
    T: 1568014460891,
    s: 'BNBUSDT',
    ps: 'BNBUSDT',
    b: '25.35190000',
    B: '31.21000000',
    a: '25.36520000',
    A: '40.66000000',
  };

  it('parses the documented bookTicker payload shape', () => {
    const parsed = parseBinanceBookTickerMessage(sample);
    expect(parsed).toBeDefined();
    expect(parsed).toMatchObject({
      symbol: 'BNBUSDT',
      pair: 'BNBUSDT',
      updateId: 400900217,
      eventTime: 1568014460893,
      transactionTime: 1568014460891,
      bestBid: 25.3519,
      bestBidQty: 31.21,
      bestAsk: 25.3652,
      bestAskQty: 40.66,
    });
    expect(parsed?.midPrice).toBeCloseTo((25.3519 + 25.3652) / 2, 10);
  });

  it('parses combined-stream envelopes', () => {
    const parsed = parseBinanceBookTickerMessage({
      stream: '!bookTicker',
      data: sample,
    });
    expect(parsed?.symbol).toBe('BNBUSDT');
    expect(parsed?.updateId).toBe(400900217);
  });

  it('falls back pair to symbol when ps is absent', () => {
    const parsed = parseBinanceBookTickerMessage({
      ...sample,
      ps: undefined,
    });
    expect(parsed?.pair).toBe('BNBUSDT');
  });

  it('rejects malformed payloads', () => {
    expect(parseBinanceBookTickerMessage(null)).toBeUndefined();
    expect(parseBinanceBookTickerMessage({ ...sample, s: '' })).toBeUndefined();
    expect(parseBinanceBookTickerMessage({ ...sample, b: 'NaN' })).toBeUndefined();
    expect(parseBinanceBookTickerMessage({ ...sample, A: '-1' })).toBeUndefined();
    expect(parseBinanceBookTickerMessage({ ...sample, e: 'aggTrade' })).toBeUndefined();
  });
});
