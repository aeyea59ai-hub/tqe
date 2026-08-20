import dns from 'dns/promises';
import net from 'net';

/**
 * Outbound provider URL policy (SSRF containment).
 *
 * Blueprint `0091_AI_DESK_PROVIDER_GATEWAY_SECURITY_SSRF_SECRETS_AND_DATA_EGRESS`
 * requires that a provider `base_url` supplied by the owner cannot be turned
 * into an arbitrary outbound request from the server.
 *
 * Policy:
 *  1. Only `http:` and `https:` are permitted.
 *  2. Embedded credentials (`user:pass@host`) are rejected.
 *  3. Loopback is explicitly permitted — the product is local-first and routes
 *     to Ollama / llama.cpp on `127.0.0.1` (blueprint `0046`).
 *  4. Any other address that resolves into a private, link-local, unique-local,
 *     carrier-grade-NAT, multicast or reserved range is rejected. This blocks
 *     cloud instance-metadata endpoints such as `169.254.169.254`.
 *  5. Every remaining (public) host must appear in the owner-approved
 *     allow-list.
 */

export class ProviderUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderUrlError';
  }
}

/** Hosts that are always local model runtimes. */
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/** Owner-approved public provider hosts. */
const DEFAULT_ALLOWED_HOSTS = [
  'generativelanguage.googleapis.com',
  'api.openai.com',
  'api.anthropic.com',
  'api.moonshot.cn',
  'api.moonshot.ai',
  'api.ollama.com',
  'ollama.com',
];

/**
 * Additional hosts may be approved by the owner through the environment, e.g.
 * `SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS=my-gateway.internal.example`.
 */
export function allowedHosts(): Set<string> {
  const extra = (process.env.SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_HOSTS, ...extra]);
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map((p) => Number(p));
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function inCidr(ip: string, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

export function isLoopbackAddress(ip: string): boolean {
  if (net.isIPv4(ip)) return inCidr(ip, '127.0.0.0', 8);
  const normalized = ip.toLowerCase();
  if (normalized === '::1') return true;
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);
  return mapped ? isLoopbackAddress(mapped[1]) : false;
}

/**
 * True for any address that must never be reachable from a user-supplied
 * provider URL. Loopback is handled separately and is *not* reported here.
 */
export function isBlockedAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    return (
      inCidr(ip, '0.0.0.0', 8) ||
      inCidr(ip, '10.0.0.0', 8) ||
      inCidr(ip, '100.64.0.0', 10) ||
      inCidr(ip, '169.254.0.0', 16) ||
      inCidr(ip, '172.16.0.0', 12) ||
      inCidr(ip, '192.0.0.0', 24) ||
      inCidr(ip, '192.0.2.0', 24) ||
      inCidr(ip, '192.168.0.0', 16) ||
      inCidr(ip, '198.18.0.0', 15) ||
      inCidr(ip, '224.0.0.0', 4) ||
      inCidr(ip, '240.0.0.0', 4)
    );
  }

  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '');
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);
  if (mapped) return isBlockedAddress(mapped[1]);
  if (normalized === '::') return true;
  // fc00::/7 unique-local, fe80::/10 link-local, ff00::/8 multicast
  return /^f[cd]/.test(normalized) || /^fe[89ab]/.test(normalized) || /^ff/.test(normalized);
}

export interface ProviderUrlDecision {
  url: URL;
  /** A loopback target is a local model runtime and skips the host allow-list. */
  isLoopback: boolean;
}

/**
 * Synchronous structural validation. Safe to call on the request path before
 * persisting a provider record.
 */
export function assertProviderUrlAllowed(rawUrl: unknown): ProviderUrlDecision {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    throw new ProviderUrlError('base_url is required and must be a string.');
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ProviderUrlError('base_url is not a valid absolute URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ProviderUrlError(`base_url scheme "${url.protocol}" is not permitted; use http or https.`);
  }

  if (url.username || url.password) {
    throw new ProviderUrlError('base_url must not embed credentials.');
  }

  const hostname = url.hostname.toLowerCase();

  if (LOOPBACK_HOSTNAMES.has(hostname) || (net.isIP(hostname) && isLoopbackAddress(hostname))) {
    return { url, isLoopback: true };
  }

  if (net.isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new ProviderUrlError('base_url resolves to a private, link-local or reserved address.');
    }
    throw new ProviderUrlError(
      'base_url must use an approved provider hostname rather than a bare public IP address.',
    );
  }

  if (!allowedHosts().has(hostname)) {
    throw new ProviderUrlError(
      `Provider host "${hostname}" is not approved. Add it to SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS to approve it.`,
    );
  }

  return { url, isLoopback: false };
}

/**
 * Full validation including DNS resolution. Use before making the outbound
 * request, so an approved hostname cannot be re-pointed at an internal address.
 */
export async function assertProviderUrlResolvable(rawUrl: unknown): Promise<ProviderUrlDecision> {
  const decision = assertProviderUrlAllowed(rawUrl);
  if (decision.isLoopback) return decision;

  const hostname = decision.url.hostname;
  if (net.isIP(hostname)) return decision;

  let addresses: string[];
  try {
    addresses = (await dns.lookup(hostname, { all: true })).map((a) => a.address);
  } catch {
    throw new ProviderUrlError(`Provider host "${hostname}" could not be resolved.`);
  }

  for (const address of addresses) {
    if (isBlockedAddress(address) || isLoopbackAddress(address)) {
      throw new ProviderUrlError(
        `Provider host "${hostname}" resolves to a non-public address and was blocked.`,
      );
    }
  }

  return decision;
}
