# ADR 0002 — Design system: C+ retained as an interim step (provisional)

- **Status:** Accepted (provisional — requires owner countersignature)
- **Date:** 2026-08-20

## Context

Two design systems are specified in this repository and they disagree.

| Aspect | C+ (as built, `docs/cplus-phase1/CPLUS_DESIGN_SYSTEM.md`) | Quiet Grid Terminal (blueprint `0013`, `0011`) |
|---|---|---|
| App background | `#060A11` | `#090D10` |
| Surface | `#0A0F19` / `#0B101A` | `#0D1418` / `#121C21` |
| Accent | cyan `300/400` | `#7DE2C4` |
| Focus ring | Tailwind `focus-visible` default | `#8AB4F8`, 2px, 2px offset |
| LONG / SHORT | emerald / rose | `#2ED09A` / `#FF6B73` |
| Navigation | 248px labelled sidebar, 72px collapsed | 56px rail |
| Inspector | ~300–330px | 336px |
| Typography | Tailwind default stack | Inter + IBM Plex Mono, tabular numerics |
| Top-level nav items | 11 items across 6 groups | 9 items (`0036` Resolution 3) |
| Routes | string page-ids | `/home`, `/market/:symbol`, `/scan`, … |

Blueprint `0034_TARGET_PRODUCT_CONTRACT.md` is explicit that a donor layout must
not be preserved merely because a donor implementation used it.

## Decision

Retain the **C+ design system as an interim baseline**. Do not retokenise to
Quiet Grid Terminal in this change set.

## Rationale

C+ Phase 1 is the only rendering UI available, and it was never verified in a
browser — its own validation record marks every browser, E2E, mobile and
screenshot check as `NOT RUN`. Retokenising an unverified UI would change the
visual target and the verification baseline simultaneously, leaving no known-good
reference to compare against.

The ordering is therefore: verify C+ first (Phases 2, 3, 6), converge second.

## Consequences

- C+ is explicitly **interim**, not the target. Quiet Grid Terminal remains the
  contracted destination.
- Convergence work is recorded in `docs/STRUCTURAL_DEBT.md` so it is scheduled
  rather than silently dropped.
- Until convergence, the UI does **not** satisfy blueprint `0013`/`0011`/`0036`,
  and no release claim may state otherwise.
