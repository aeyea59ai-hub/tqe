# ADR 0005 — Fabricated data is not permitted on a decision path

- **Status:** Accepted (enforced in CI)
- **Date:** 2026-08-20
- **Applies to:** Phase 4 (security), Phase 5 (fabricated data)

## Context

The product contract is explicit: when data is missing, stale, malformed or
contradictory, the system must produce an **explicit non-actionable result**. It
must never invent a number and present it as evidence.

The C+ Phase 1 prototype adopted under [ADR 0001](0001-architecture-track.md)
violates this in four files. A determinism scan of the tracked tree at import
time found 24 `Math.random()` call sites on non-test paths:

| File | Sites | What is fabricated |
| --- | --- | --- |
| `app/server.ts` | 12 | Synthetic candles, funding rate, open interest, long/short and taker ratios, order-book depth |
| `app/src/components/QuantAgentsLive.tsx` | 6 | Agent proposals and a coin-flip risk veto |
| `app/src/lib/backtestEngine.ts` | 4 | Random OHLCV for the historical dataset |
| `app/src/App.tsx` | 2 | `change24h` / `volume24h` fallbacks |

These are not incidental. Several sit directly on a path that feeds risk
evaluation, sizing and the backtest report — exactly where an invented number is
indistinguishable from evidence.

## Decision

1. `Math.random()` is forbidden in any price, indicator, derivative, risk,
   sizing or paper-accounting path.
2. This is enforced mechanically by `scripts/check-determinism.mjs`, run in CI.
3. The inherited violations are pinned in `scripts/determinism-baseline.json`.
   The guard fails on any **new** violation, and also fails if a baseline entry
   is stale — so the baseline can only ever shrink. Phase 5 drives it to zero.
4. Test fixtures and files under `test/` are exempt by path. Fixtures in
   `app/test/fixtures.ts` are deterministic builders and contain no randomness
   or wall-clock reads, so test data is reproducible.
5. A line may be exempted only by the literal token `determinism-allow`, which
   keeps every exemption greppable and reviewable.

## Consequences

- CI is green today without pretending the debt does not exist. The exact size
  of the debt is a tracked number that can only go down.
- Phase 5 must replace each site with an explicit `UNAVAILABLE` / stale state
  surfaced in the UI, or with a hard-labelled `DEMO` / `SYNTHETIC` dataset that
  cannot produce a publishable result.
- Until the baseline reaches zero, no output of this repository may be presented
  as evidence for a trading decision. This reinforces
  [ADR 0003](0003-release-status.md).

## Alternatives rejected

- **Delete the randomness immediately.** Rejected for this phase: removing the
  synthetic generators without first building the non-actionable UI states would
  leave the app broken rather than honest, and Phase 4 (security) was sequenced
  first deliberately.
- **Disable the check until Phase 5.** Rejected: it would leave new violations
  free to enter alongside the fixes.
