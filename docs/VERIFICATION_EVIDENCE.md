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
| Unit tests | `npm test` (`vitest run`) | 0 | **PASS** — 3 files, 5 tests |
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

## Not run

| Check | Status | Missing tool | Command that would execute it |
|---|---|---|---|
| Browser / DOM click coverage | `NOT_RUN_ENVIRONMENT` | Playwright browsers + OS deps (`libgbm`, `libnss3`) | `npx playwright test` |
| End-to-end user flows | `NOT_RUN_ENVIRONMENT` | Playwright | `npx playwright test` |
| Mobile viewport / RTL / reduced-motion E2E | `NOT_RUN_ENVIRONMENT` | Playwright | `npx playwright test --project=mobile` |
| Load test (50 users / 100 spike) | `NOT_RUN_ENVIRONMENT` | k6 | `k6 run load_test.js` |
| Screenshot fidelity comparison | `NOT_RUN_ENVIRONMENT` | Playwright + reference captures | `npx playwright test --update-snapshots` |

These remain the honest gap. See `docs/STRUCTURAL_DEBT.md`.
