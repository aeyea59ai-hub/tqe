# Structural debt backlog

This file is the tracked, non-drifting record of known structural gaps between
what this repository contains and what the governing blueprints require. It
exists so that debt is **scheduled explicitly** rather than rediscovered.

Nothing here is a defect in the sense of "something broke". Each item is a
capability the product contract requires that the imported C+ Phase 1 prototype
([ADR 0001](adr/0001-architecture-track.md)) does not provide.

## Status legend

| Status | Meaning |
| --- | --- |
| `OPEN` | Not started. |
| `PARTIAL` | Mechanism exists but does not yet meet the contract. |
| `GUARDED` | Not fixed, but a CI check prevents it from getting worse. |

---

## SD-01 — Paper ledger has no integrity chain (`OPEN`)

**Contract:** an append-only, hash-chained journal held server-side, covered by
TC-PAPER-001 / 002 / 003 and TC-JRN-001.

**Reality:** paper state lives in browser `localStorage`. There is no server-side
ledger, no append-only guarantee and no hash chain. Clearing site data destroys
the record; nothing detects tampering.

**Work:** move paper state server-side; append-only writes with a per-entry hash
over the previous entry; verification endpoint; the four named test cases.

**Why it matters:** a paper-trading record that can be silently edited is not
evidence, which undercuts the entire purpose of the product.

---

## SD-02 — No database migrations (`OPEN`)

**Contract:** versioned, immutable, reproducible migrations.

**Reality:** `better-sqlite3` runs raw `CREATE TABLE IF NOT EXISTS` at startup in
`app/src/lib/db.ts`. There is no schema version, no upgrade path, and no way to
reproduce a given schema state.

**Work:** introduce a migration runner with numbered, immutable migration files
and a `schema_migrations` table; convert the current bootstrap into migration
0001.

**Blocks:** SD-01, which adds tables.

---

## SD-03 — No internationalisation or RTL support (`OPEN`)

**Contract:** Arabic and English, full RTL layout mirroring, and LTR financial
numerics inside RTL text (TC-RTL-001).

**Reality:** the UI is English-only with hard-coded strings and no `dir`
handling.

**Work:** extract strings to a message catalogue; add locale switching; mirror
layout under `dir="rtl"`; force LTR numeric runs for prices, sizes and P&L;
implement TC-RTL-001.

---

## SD-04 — Navigation uses string page-ids, not routes (`OPEN`)

**Contract:** real routes.

**Reality:** `App.tsx` switches on a string page-id in component state. URLs are
not addressable, the back button does not work, and no view is linkable or
bookmarkable.

**Work:** adopt React Router; map the 10 planned routes; preserve deep-link state
for symbol and timeframe.

**Note:** Phase 6 route render tests depend on this. Writing them against the
current string-switch shell would mean rewriting them immediately afterwards.

---

## SD-05 — Design system convergence undecided (`PARTIAL`)

**Contract:** governed by [ADR 0002](adr/0002-design-system-direction.md), which
is **provisional and awaiting owner ratification** (question Q6).

**Reality:** the C+ token set is in place and internally consistent. Whether it
is the destination or an interim step toward Quiet Grid Terminal is unresolved.

**Work if Quiet Grid Terminal is chosen:** retoken to `#090D10` / `#7DE2C4` /
`#8AB4F8`; adopt the 56px rail and 336px inspector; collapse navigation to the 9
mandated top-level items.

**Do not start** until ADR 0002 is ratified. Retokening twice is pure waste.

---

## SD-06 — Fabricated data on decision paths (`GUARDED`)

**Contract:** missing, stale, malformed or contradictory data must yield an
explicit non-actionable result.

**Reality:** 24 `Math.random()` call sites across four files, pinned in
`scripts/determinism-baseline.json`.

**Guard:** `scripts/check-determinism.mjs` fails CI on any new violation and on
any stale baseline entry, so the number can only shrink.

**Work:** Phase 5. See [ADR 0005](adr/0005-fabricated-data-policy.md).

---

## SD-07 — Anti-skip test gate is failing (`GUARDED`)

**Contract:** every component, route, endpoint, control and flow is exercised.

**Reality:** the shipped `final_report.txt` recorded 22 components, 10 routes,
17 endpoints, 88 controls and 15 flows with **0 tested**. Phases 2 and 4 added
real domain and security tests, but coverage of components, routes, endpoints
and flows remains at zero.

**Guard:** CI runs the full suite on every push, so the current true number is
always visible rather than asserted.

**Work:** Phase 6 — API integration tests against a mocked exchange provider,
component and route render tests for the 14 C+ acceptance rules, and Playwright
E2E for the 15 flows and 88 controls including mobile viewport, RTL, keyboard
focus and reduced-motion checks.

**Depends on:** SD-04 (routes) and SD-03 (RTL) for the relevant subsets.

---

## SD-08 — Local API is unauthenticated (`OPEN`)

**Contract:** not directly specified; the product is local-first and
single-owner.

**Reality:** the API has no authentication. Phase 4 changed the bind address from
`0.0.0.0` to `127.0.0.1`, which removes local-network exposure, but any process
or page able to reach loopback can still call every endpoint.

**Work:** decide whether a local token or origin check is warranted. Recorded
here rather than silently assumed safe. See
[ADR 0006](adr/0006-provider-gateway-security.md).

---

## SD-09 — Dead code retained (`OPEN`)

**Reality:** `app/src/components/Header.tsx` exists but is never mounted.

**Work:** remove it, or document why it is retained. Kept for now because
deleting inherited files before the owner has ratified ADR 0001 would discard
material that Track B might want.

---

## SD-10 — Canonical developer package absent (`OPEN`, blocking)

**Reality:** `SIGNAL_DESK_GOOGLE_AI_STUDIO_COMPLETE_DEVELOPER_PACKAGE_v2.0.0_20260813.zip`
is not in the repository. Only its `.sha256.txt` provenance stubs are committed.

**Consequence:** no work in this repository can be labelled U7 PASS or U8 Final
Release. See [ADR 0003](adr/0003-release-status.md).

**Work:** the owner must either supply the package (enabling Track B) or ratify
Track A as permanent.

---

## Sequencing

```
SD-02 (migrations) ──► SD-01 (paper ledger)
SD-04 (routing)    ──► SD-07 (route/E2E tests)
SD-03 (i18n/RTL)   ──► SD-07 (RTL test subset)
ADR 0002 ratified  ──► SD-05 (retokening)
ADR 0001 ratified  ──► SD-09, SD-10
SD-06 (Phase 5)    ──  independent, do first
```

SD-06 is independent and highest value: until it is closed, every other
improvement sits on top of numbers that may be invented.
