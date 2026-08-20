# Project Status and Correct Decision Table

**Updated:** 2026-08-20 — rewritten to state the tracked-source reality after the
C+ Phase 1 source was extracted into `app/` (Phase 1) and verified (Phase 2).

## What changed

This repository previously contained **no tracked application source** — only
governance documents and archives. It now contains a tracked, installable,
type-checking, building and testing application at `app/`, adopted under
[ADR 0001](docs/adr/0001-architecture-track.md).

That changes the "is there source?" answer. It does **not** change any release
status.

## Decision table

| Use or claim | Supported? | Governing interpretation |
|---|---:|---|
| Read, build and run the tracked C+ baseline from source | **Yes** | `app/` installs, type-checks, builds, tests and serves. See `docs/VERIFICATION_EVIDENCE.md`. |
| Send to a developer to continue Signal Desk | Yes | Source, blueprints, ADRs, evidence and debt register are included. |
| Understand current source, target blueprints and required tests | Yes | Blueprint archives and the test blueprint are included. |
| Treat `app/` as the canonical `signal-desk/` source | **No** | `app/` is the C+ prototype. Canonical identity `63be8ecd83eeae88e1affaf46d85b2ef6ed70d51` is absent from this repository. |
| Treat `app/` as the contracted architecture | **No** | Contract is React + **Python FastAPI**. `app/` is React + **Node/Express**. See ADR 0001. |
| Treat the UI as meeting the target design system | **No** | C+ is interim; Quiet Grid Terminal is the target. See ADR 0002. |
| Treat as a fully working final application | **No** | Mandatory implementation and verification remain. |
| Treat as U7 PASS | **No** | U7 remains BLOCKED. See ADR 0003. |
| Treat as U8 Final Release | **No** | U8 is pending and not released. See ADR 0003. |
| Treat ATM as integrated in the canonical source | **No** | ATM is a target experimental integration; the donor candidate is reference-only. |
| Treat AI Trading Desk as implemented | **No** | Blueprint and supporting skills exist; canonical runtime implementation is not proven complete. |
| Treat Skill Control Plane as implemented | **No** | Blueprint and skill packages exist; implementation is not proven. |
| Treat Full-History Authoritative Reconstruction as complete | **No** | The process has not been executed to owner-approved completion. |

## Release truth

A large package, valid ZIP, rendered preview, written test catalog or historical
PASS log cannot change these statuses. Only fresh evidence from one exact final
source tree can move the project through U7 and U8.

**The canonical source tree is not present in this repository.** Green CI here
proves that the C+ prototype at `app/` is healthy. It is not, and cannot be,
evidence for U7 or U8.

## Verification reality

| Gate | Before | Now |
|---|---|---|
| Dependency install | BLOCKED (DNS `EAI_AGAIN`) | PASS |
| `npm run lint` | NOT RUN | PASS |
| Production build | NOT RUN | PASS |
| Vitest | NOT RUN (no `test` script) | PASS |
| Serve production build | NOT RUN | PASS |
| Browser / E2E / mobile | NOT RUN | Still not run — see `docs/VERIFICATION_EVIDENCE.md` |

Anything still unexecuted is recorded as `NOT_RUN_ENVIRONMENT` with the precise
missing tool. Nothing is silently skipped.
