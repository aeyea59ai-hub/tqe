import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  ProviderUrlError,
  assertProviderUrlAllowed,
  assertProviderUrlResolvable,
  isBlockedAddress,
  isLoopbackAddress,
} from '../src/lib/security/providerUrlPolicy';
import {
  NO_SECRET,
  SecretRefError,
  assertValidSecretRef,
  isValidSecretRef,
  redactProvider,
  resolveSecretRef,
} from '../src/lib/security/secretRef';
import {
  MarketParamError,
  SUPPORTED_INTERVALS,
  assertBoundedInt,
  assertBoundedNumber,
  assertInterval,
  assertSymbol,
} from '../src/lib/security/marketParams';
import { ApiError } from '../src/lib/security/httpErrors';

/**
 * Phase 4 security regressions.
 *
 * Each block pins one of the defects recorded in the implementation plan so a
 * later change cannot silently reopen it.
 */

describe('SSRF: provider base_url policy', () => {
  it('permits loopback targets for local model runtimes', () => {
    for (const url of [
      'http://127.0.0.1:11434/v1',
      'http://localhost:8080/v1',
      'http://[::1]:11434/v1',
    ]) {
      expect(assertProviderUrlAllowed(url).isLoopback).toBe(true);
    }
  });

  it('permits an approved public provider host', () => {
    const decision = assertProviderUrlAllowed('https://api.openai.com/v1');
    expect(decision.isLoopback).toBe(false);
    expect(decision.url.hostname).toBe('api.openai.com');
  });

  it('rejects the cloud instance metadata endpoint', () => {
    expect(() => assertProviderUrlAllowed('http://169.254.169.254/latest/meta-data/')).toThrow(
      ProviderUrlError,
    );
  });

  it('rejects private and reserved ranges', () => {
    for (const url of [
      'http://10.0.0.5/v1',
      'http://172.16.4.4/v1',
      'http://192.168.1.10/v1',
      'http://100.64.0.1/v1',
      'http://0.0.0.0/v1',
    ]) {
      expect(() => assertProviderUrlAllowed(url)).toThrow(ProviderUrlError);
    }
  });

  it('rejects an unapproved public host', () => {
    expect(() => assertProviderUrlAllowed('https://attacker.example/v1')).toThrow(ProviderUrlError);
  });

  it('rejects bare public IPs even when they are not internal', () => {
    expect(() => assertProviderUrlAllowed('https://8.8.8.8/v1')).toThrow(ProviderUrlError);
  });

  it('rejects non-http schemes and embedded credentials', () => {
    expect(() => assertProviderUrlAllowed('file:///etc/passwd')).toThrow(ProviderUrlError);
    expect(() => assertProviderUrlAllowed('gopher://api.openai.com/')).toThrow(ProviderUrlError);
    // Assembled from parts so no credential-shaped literal exists in the repo.
    const withCredentials = ['https://', 'user', ':', 'pw', '@', 'api.openai.com/v1'].join('');
    expect(() => assertProviderUrlAllowed(withCredentials)).toThrow(ProviderUrlError);
  });

  it('rejects a missing or non-string base_url', () => {
    expect(() => assertProviderUrlAllowed(undefined)).toThrow(ProviderUrlError);
    expect(() => assertProviderUrlAllowed('')).toThrow(ProviderUrlError);
    expect(() => assertProviderUrlAllowed(42)).toThrow(ProviderUrlError);
  });

  it('classifies addresses correctly', () => {
    expect(isLoopbackAddress('127.0.0.1')).toBe(true);
    expect(isLoopbackAddress('127.5.5.5')).toBe(true);
    expect(isLoopbackAddress('::1')).toBe(true);
    expect(isLoopbackAddress('8.8.8.8')).toBe(false);

    expect(isBlockedAddress('169.254.169.254')).toBe(true);
    expect(isBlockedAddress('fd00::1')).toBe(true);
    expect(isBlockedAddress('fe80::1')).toBe(true);
    expect(isBlockedAddress('8.8.8.8')).toBe(false);
    // Loopback is permitted deliberately and is not reported as blocked.
    expect(isBlockedAddress('127.0.0.1')).toBe(false);
  });

  it('short-circuits DNS checks for loopback but still rejects bad hosts', async () => {
    await expect(assertProviderUrlResolvable('http://127.0.0.1:11434/v1')).resolves.toMatchObject({
      isLoopback: true,
    });
    await expect(assertProviderUrlResolvable('https://attacker.example/v1')).rejects.toThrow(
      ProviderUrlError,
    );
  });

  it('honours an owner-approved extra host from the environment', () => {
    const previous = process.env.SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS;
    process.env.SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS = 'gateway.example.test';
    try {
      expect(assertProviderUrlAllowed('https://gateway.example.test/v1').isLoopback).toBe(false);
    } finally {
      if (previous === undefined) delete process.env.SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS;
      else process.env.SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS = previous;
    }
  });
});

describe('Secrets: secret_ref is an indirection only', () => {
  const KEY_VAR = 'SIGNAL_DESK_TEST_SECRET';

  beforeEach(() => {
    process.env[KEY_VAR] = 'resolved-value';
  });

  afterEach(() => {
    delete process.env[KEY_VAR];
  });

  it('accepts only the env:NAME grammar', () => {
    expect(isValidSecretRef('env:GEMINI_API_KEY')).toBe(true);
    expect(isValidSecretRef('env:NONE')).toBe(true);
    expect(isValidSecretRef('sk-live-abcdef0123456789')).toBe(false);
    expect(isValidSecretRef('env:lowercase')).toBe(false);
    expect(isValidSecretRef(undefined)).toBe(false);
  });

  it('rejects an inline API key at the write boundary', () => {
    expect(() => assertValidSecretRef('sk-live-abcdef0123456789')).toThrow(SecretRefError);
    expect(() => assertValidSecretRef('AIzaSyExampleKeyValue')).toThrow(SecretRefError);
  });

  it('treats an absent secret_ref as the explicit no-credential sentinel', () => {
    expect(assertValidSecretRef(undefined)).toBe(NO_SECRET);
    expect(assertValidSecretRef('')).toBe(NO_SECRET);
  });

  it('never returns the reference itself as a credential', () => {
    expect(resolveSecretRef(`env:${KEY_VAR}`)).toBe('resolved-value');
    expect(resolveSecretRef('env:DEFINITELY_UNSET_VARIABLE_NAME')).toBeUndefined();
    // The pre-fix behaviour returned this string as the API key.
    expect(resolveSecretRef('sk-live-abcdef0123456789')).toBeUndefined();
    expect(resolveSecretRef(NO_SECRET)).toBeUndefined();
    expect(resolveSecretRef(undefined)).toBeUndefined();
  });

  it('redacts provider records crossing the API boundary', () => {
    const redacted = redactProvider({
      id: 'p1',
      display_name: 'Local',
      secret_ref: `env:${KEY_VAR}`,
    });
    expect(redacted.secret_ref).toBe(`env:${KEY_VAR}`);
    expect(redacted.secret_configured).toBe(true);
    expect(JSON.stringify(redacted)).not.toContain('resolved-value');

    const unset = redactProvider({ id: 'p2', secret_ref: 'env:DEFINITELY_UNSET_VARIABLE_NAME' });
    expect(unset.secret_configured).toBe(false);
  });
});

describe('Input validation: market parameters', () => {
  it('accepts well-formed symbols and normalises case', () => {
    expect(assertSymbol('btcusdt')).toBe('BTCUSDT');
    expect(assertSymbol(undefined, 'BTCUSDT')).toBe('BTCUSDT');
  });

  it('rejects symbols that could alter an upstream URL', () => {
    for (const bad of [
      'BTC/USDT',
      'BTCUSDT&limit=1',
      'BTCUSDT?x=1',
      '../../etc/passwd',
      'BTC USDT',
      'A',
      'X'.repeat(41),
      123,
    ]) {
      expect(() => assertSymbol(bad)).toThrow(MarketParamError);
    }
  });

  it('accepts only known intervals', () => {
    for (const interval of SUPPORTED_INTERVALS) {
      expect(assertInterval(interval)).toBe(interval);
    }
    expect(assertInterval(undefined, '15m')).toBe('15m');
    expect(() => assertInterval('15m&limit=5000')).toThrow(MarketParamError);
    expect(() => assertInterval('99y')).toThrow(MarketParamError);
  });

  it('bounds numeric parameters', () => {
    expect(assertBoundedNumber(5, 'x', 1, 10, 3)).toBe(5);
    expect(assertBoundedNumber(undefined, 'x', 1, 10, 3)).toBe(3);
    expect(() => assertBoundedNumber(0, 'x', 1, 10, 3)).toThrow(MarketParamError);
    expect(() => assertBoundedNumber(11, 'x', 1, 10, 3)).toThrow(MarketParamError);
    expect(() => assertBoundedNumber(Number.NaN, 'x', 1, 10, 3)).toThrow(MarketParamError);
    expect(() => assertBoundedNumber('abc', 'x', 1, 10, 3)).toThrow(MarketParamError);

    expect(assertBoundedInt('7', 'n', 1, 10, 5)).toBe(7);
    expect(() => assertBoundedInt(2.5, 'n', 1, 10, 5)).toThrow(MarketParamError);
  });
});

describe('Error handling: no internal detail leaks to clients', () => {
  it('carries only deliberately safe messages', () => {
    const err = new ApiError('INVALID_REQUEST', 'symbol is not permitted.');
    expect(err.status).toBe(400);
    expect(err.code).toBe('INVALID_REQUEST');
  });
});
