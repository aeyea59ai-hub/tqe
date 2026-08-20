# ADR 0006 — AI provider gateway security posture

- **Status:** Accepted
- **Date:** 2026-08-20
- **Applies to:** Phase 4 (security)
- **Implements:** blueprint `0091_AI_DESK_PROVIDER_GATEWAY_SECURITY_SSRF_SECRETS_AND_DATA_EGRESS`

## Context

The imported C+ prototype exposed an owner-facing provider gateway with four
defects that are exploitable by anything able to reach the local API — including
a malicious page in the owner's browser, because the server bound `0.0.0.0`.

1. **SSRF.** `POST` / `PATCH /api/v1/ai/providers` accepted an arbitrary
   `base_url`, which `openAiCompatibleAdapter` then fetched. Nothing stopped a
   provider pointing at `http://169.254.169.254/` or an internal host.
2. **Secrets.** `geminiAdapter` treated `secret_ref` as a literal API key when it
   was not exactly `env:GEMINI_API_KEY`; `openAiCompatibleAdapter` did the same.
   `secret_ref` was persisted in SQLite and returned verbatim by the providers
   `GET` endpoint.
3. **Input validation.** `symbol` and `interval` were interpolated into upstream
   Binance URLs without validation, and no request body was validated.
4. **Error handling.** Provider and routing endpoints returned raw `err.message`,
   leaking SQLite constraint text, filesystem paths and upstream response bodies.

## Decision

**Network exposure.** The server binds `127.0.0.1` by default (`HOST` may be set
deliberately by the operator). The product is local-first and single-owner.

**SSRF containment** — `src/lib/security/providerUrlPolicy.ts`:

- `http:` and `https:` only; embedded credentials rejected.
- Loopback is explicitly permitted, because Ollama and llama.cpp are first-class
  local runtimes.
- Any address in a private, link-local, unique-local, carrier-grade-NAT,
  multicast or reserved range is rejected. This covers cloud instance-metadata
  endpoints.
- Every remaining public host must be on an owner-approved allow-list, extendable
  through `SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS`.
- Bare public IPs are rejected in favour of approved hostnames.
- The policy is re-checked **with DNS resolution immediately before egress**, so
  an approved hostname cannot be re-pointed at an internal address between
  configuration and use.

**Secrets** — `src/lib/security/secretRef.ts`:

- `secret_ref` is an indirection only. The sole accepted grammar is `env:NAME`.
- The literal-key fallback is removed from both adapters. A malformed reference
  now resolves to *no credential* rather than being sent as one.
- An inline key is rejected at the write boundary, so it can never reach SQLite.
- The providers `GET` endpoint returns `getPublicProviders()`, which emits the
  *name* of the indirection plus a `secret_configured` boolean. The value never
  crosses the API boundary.

**Input validation** — `src/lib/security/marketParams.ts`: `symbol` and
`interval` are allow-listed before any upstream URL interpolation; backtest body
parameters are bounded; `routing_mode` is allow-listed.

**Error handling** — `src/lib/security/httpErrors.ts`: only errors deliberately
raised as client-input errors carry their message outward. Everything else
returns a generic `INTERNAL_ERROR` and is logged server-side.

**Forbidden-surface scan** — `scripts/check-forbidden-surfaces.mjs` automates
TC-SEC-001 in CI: no live-order, signed-request, private-key, withdrawal,
transfer or leverage-mutation surface may exist. Exemptions require the literal
token `tc-sec-001-allow`.

## Consequences

- Adding a new cloud provider host is now a deliberate act (allow-list edit or
  environment variable) rather than a side effect of filling in a form field.
- Existing provider rows containing an inline key are no longer usable as
  credentials; they resolve to no credential and the call proceeds unauthenticated
  or fails at the provider. This is the intended direction of failure.
- 21 regression tests in `app/test/security.test.ts` pin each fix.

## Not addressed here

Authentication and authorisation of the local API itself. The gateway is
loopback-only and single-owner; adding an auth layer is recorded in
`docs/STRUCTURAL_DEBT.md` rather than being silently assumed.
