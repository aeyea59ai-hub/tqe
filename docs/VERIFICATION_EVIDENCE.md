# Verification Evidence

Fresh execution establishes the current result. Historical results provide
context only (`0002_CONTINUOUS_BUILD_MODE.md`).

Every gate below records the command, the exit code and the environment. Any
check that could not run is recorded as `NOT_RUN_ENVIRONMENT` with the precise
missing tool — never as a pass, never silently skipped.

- **Scope of this evidence:** `app/` (C+ Phase 1 prototype, ADR 0001).
- **This is not evidence for U7 or U8** (ADR 0003).

## Environment

| Item | Value |
|---|---|
| Date (UTC) | 2026-08-20 |
| Node | v22.23.2 |
| npm | 10.9.8 |
| Platform | linux x64 |

The original Phase 1 recorded Node v22.16.0 and warned that `jsdom@30.0.1` and
`undici@8.10.0` require a newer Node 22 patch. `package.json` now pins
`engines.node >= 22.18.0`, and CI is pinned to the same range.

## Phase 1 gate — source integrity

The tracked tree was reconciled against the two integrity files shipped inside
`SIGNAL_DESK_CPLUS_UI_PHASE1_SOURCE_20260820(2).zip`.

| Check | Result |
|---|---|
| `sha256sum -c CPLUS_UI_CHECKSUMS.sha256` | 88 / 88 OK |
| Manifest entries in `CPLUS_UI_FILE_MANIFEST.json` | 87 |
| Application files tracked into `app/`, byte-identical | 57 |
| Preserved C+ docs, byte-identical | 4 (2 more are the self-referential manifest and checksum files) |
| Build detritus intentionally excluded | 26 |
| Manifest entries unaccounted for | **0** |
| Files in `app/` absent from the manifest | **0** |

Nothing was altered in transit.

### Intentionally excluded from tracking

One-off AI Studio mutation scripts and superseded run reports, none of which are
part of the application: `fix_*.cjs` (4), `patch_*.cjs` (5), `update_*.cjs` (5),
`generate_*.cjs` / `.js` (5), `types_update.cjs`, `update_scanner.patch`,
`strategies_to_add.txt`, `final_report.txt`, `phase2_report.txt`,
`assets/.aistudio/.gitignore`, and the original `.gitignore` (replaced).

## Phase 2 gate — toolchain

| Check | Command | Exit | Result |
|---|---|---:|---|
| Install from lockfile | `npm ci --no-audit --no-fund` | 0 | **PASS** — 302 packages |
| Type check | `npm run lint` (`tsc --noEmit`) | 0 | **PASS** |
| Unit tests | `npm test` (`vitest run`) | 0 | **PASS** — 4 files, 26 tests (3 files / 5 tests at the Phase 2 gate; Phase 4 added 21) |
| Production build | `npm run build` | 0 | **PASS** |
| Serve build | `node dist/server.cjs`, `curl /` and `/api/v1/ai/routing` | — | **PASS** — HTTP 200 |

Build output: `dist/index.html` 0.44 kB, `dist/assets/index-*.css` 70.80 kB,
`dist/assets/index-*.js` 435.22 kB, `dist/server.cjs` 100.5 kB.

### Defect found and fixed by the first honest type check

`npm run lint` had never been executed against real dependency types. Phase 1
used a temporary ambient-declaration harness that **excluded test files**, and
its own report stated this was not a substitute.

Running it revealed 9 `TS2353` errors in `src/lib/strategies.test.ts`: the
shipped fixture was written against a `CanonicalSnapshot` shape that does not
exist. It set `openInterestChangePct`, `bestBid`/`bidDepth`, `btcCorrelation`,
`macdValue`, `priceLevel` on four structure types, and `issues` on
`QualityReport` — none of which are declared in `src/types/index.ts`.

Fix: the invalid inline literal was replaced with a type-correct deterministic
fixture builder at `app/test/fixtures.ts`. All three original assertions were
preserved unchanged.

## Phase 3 gate — CI

`.github/workflows/ci.yml` runs on every push and pull request, pinned to Node
22.18.0. Two jobs:

- **verify** — `npm ci` → `lint` → `test` → `build` → serve smoke-check, uploading
  `evidence/` (environment, install, lint, test, build and serve logs) as a
  30-day workflow artifact. "Fresh execution establishes the current result" is
  now automatic rather than manual.
- **guards** — the two safety checks below.

## Phase 4 gate — security

Each fix is pinned by regression tests in `app/test/security.test.ts` (21 tests)
and was additionally exercised against the running production build.

| Defect | Fix | Live verification | Result |
|---|---|---|---|
| SSRF via arbitrary `base_url` | `security/providerUrlPolicy.ts` — scheme, credential, private/link-local/reserved range and host allow-list checks, re-validated with DNS immediately before egress | `POST` with `http://169.254.169.254/latest/` | **PASS** — `PROVIDER_URL_REJECTED` |
| SSRF to unapproved public host | owner allow-list, extendable via `SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS` | `POST` with `https://attacker.example/v1` | **PASS** — `PROVIDER_URL_REJECTED` |
| Loopback must stay usable (Ollama / llama.cpp) | loopback explicitly permitted, skips the allow-list | `POST` with `http://127.0.0.1:11434/v1` | **PASS** — accepted |
| `secret_ref` treated as a literal API key | `security/secretRef.ts` — `env:NAME` indirection only; literal fallback removed from both adapters | `POST` with `secret_ref: "sk-live-…"` | **PASS** — `SECRET_REF_REJECTED`, never persisted |
| `secret_ref` value returned by providers `GET` | `getPublicProviders()` returns the indirection *name* plus `secret_configured` | `GET /api/v1/ai/providers` | **PASS** — no credential material in the response |
| Unvalidated `symbol` interpolated into upstream URLs | `security/marketParams.ts` allow-list | `?symbol=BTCUSDT&limit=1` | **PASS** — `INVALID_REQUEST` |
| Unvalidated `interval` | 14-value allow-list | `?tf=99y` | **PASS** — `INVALID_REQUEST` |
| Unvalidated `routing_mode` | 8-value allow-list | `PATCH` with `NONSENSE` | **PASS** — `INVALID_REQUEST` |
| Raw `err.message` returned to clients | `security/httpErrors.ts` — only deliberate client-input errors carry a message; everything else is `INTERNAL_ERROR` and logged server-side | all of the above | **PASS** — structured codes, no internal detail |
| Server bound `0.0.0.0` | binds `127.0.0.1` by default (`HOST` overridable) | startup log | **PASS** — `http://127.0.0.1:3000` |

Backtest request bodies are additionally bounded (`initialBalance`,
`riskPerTradePct`, `maxLeverage`, and ISO date validity). See
[ADR 0006](adr/0006-provider-gateway-security.md).

### Defect found while verifying the security fixes

The production SPA fallback `app.get('*')` was registered **before** the six
`/api/v1/ai/*` routes, so in a production build every AI gateway endpoint
returned `index.html` instead of executing — including the endpoints the fixes
above harden. `GET /api/v1/ai/providers` returned HTML with HTTP 200, which is
why the shadowing had never been noticed.

Client mounting now happens after all API routes. Confirmed against the built
server: `GET /api/v1/ai/routing` returns `{"success":true,"routing_mode":"AUTO"}`
and `GET /api/v1/ai/providers` returns JSON.

## Safety guards (run in CI on every push)

| Guard | Command | Exit | Result |
|---|---|---:|---|
| Forbidden trading surface (TC-SEC-001) | `node scripts/check-forbidden-surfaces.mjs` | 0 | **PASS** — 56 source files scanned, no live-order, signed-request, private-key, withdrawal, transfer or leverage-mutation surface |
| Determinism / no fabricated data | `node scripts/check-determinism.mjs` | 0 | **PASS with baseline** — 24 pre-existing `Math.random()` sites pinned in `scripts/determinism-baseline.json` |

The determinism baseline may only shrink: the guard fails on any new violation
**and** on any baseline entry that is no longer needed. Phase 5 drives it to
zero. See [ADR 0005](adr/0005-fabricated-data-policy.md).

| File | Baselined sites | What is fabricated |
|---|---:|---|
| `app/server.ts` | 12 | Synthetic candles, funding rate, open interest, long/short and taker ratios, order-book depth |
| `app/src/components/QuantAgentsLive.tsx` | 6 | Agent proposals and a coin-flip risk veto |
| `app/src/lib/backtestEngine.ts` | 4 | Random OHLCV |
| `app/src/App.tsx` | 2 | `change24h` / `volume24h` fallbacks |

## Not run

| Check | Status | Missing tool | Command that would execute it |
|---|---|---|---|
| Browser / DOM click coverage | `NOT_RUN_ENVIRONMENT` | Playwright browsers + OS deps (`libgbm`, `libnss3`) | `npx playwright test` |
| End-to-end user flows | `NOT_RUN_ENVIRONMENT` | Playwright | `npx playwright test` |
| Mobile viewport / RTL / reduced-motion E2E | `NOT_RUN_ENVIRONMENT` | Playwright | `npx playwright test --project=mobile` |
| Load test (50 users / 100 spike) | `NOT_RUN_ENVIRONMENT` | k6 | `k6 run load_test.js` |
| Screenshot fidelity comparison | `NOT_RUN_ENVIRONMENT` | Playwright + reference captures | `npx playwright test --update-snapshots` |

| API integration coverage (17 endpoints) | `NOT_RUN` | — (no missing tool; work not yet done) | Phase 6 |
| Component / route render coverage (22 components, 10 routes) | `NOT_RUN` | — (no missing tool; work not yet done) | Phase 6 |

These remain the honest gap. The anti-skip gate recorded in the shipped
`final_report.txt` (22 components, 10 routes, 17 endpoints, 88 controls, 15
flows — all 0 tested) is **still FAILING**; Phases 2 and 4 added real domain and
security tests but did not close it. See `docs/STRUCTURAL_DEBT.md` (SD-07).
