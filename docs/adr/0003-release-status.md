# ADR 0003 — Release status: U7 and U8 cannot be claimed in this repository

- **Status:** Accepted
- **Date:** 2026-08-20

## Context

Package governance defines release truth as follows
(`01_PROJECT_STATUS_AND_DECISION_TABLE.md`):

> A large package, valid ZIP, rendered preview, written test catalog or
> historical PASS log cannot change these statuses. Only fresh evidence from one
> exact final source tree can move the project through U7 and U8.

The "one exact final source tree" is the canonical `signal-desk/` tree with
identity `63be8ecd83eeae88e1affaf46d85b2ef6ed70d51`, delivered in
`SIGNAL_DESK_GOOGLE_AI_STUDIO_COMPLETE_DEVELOPER_PACKAGE_v2.0.0_20260813.zip`.

**That archive is absent from this repository.** Only its two `.sha256.txt`
provenance stubs are committed.

## Decision

No artifact, branch, tag, CI run, report or release produced in this repository
may be labelled:

- `U7 PASS`
- `U8 Final Release`
- "final application"
- ATM integrated
- AI Trading Desk implemented
- Skill Control Plane implemented
- Full-History Authoritative Reconstruction complete

## Rationale

Verification performed here applies to `app/` — the C+ Phase 1 prototype adopted
under ADR 0001. `app/` is **not** the canonical source tree. Evidence gathered
against a non-canonical tree cannot satisfy a gate defined over the canonical
tree, regardless of how green that evidence is.

## Consequences

- CI in this repository proves that `app/` installs, type-checks, builds and
  tests. It proves nothing about U7 or U8.
- The status table in `01_PROJECT_STATUS_AND_DECISION_TABLE.md` is updated to
  state the tracked-source reality rather than the archive-only reality.
- This constraint lifts only when the canonical package is present **and**
  fresh evidence is executed against it.
