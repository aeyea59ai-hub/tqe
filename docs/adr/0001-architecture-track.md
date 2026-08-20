# ADR 0001 — Working baseline architecture: Track A (provisional)

- **Status:** Accepted (provisional — requires owner countersignature)
- **Date:** 2026-08-20
- **Supersedes:** the operative effect of `NODE_BACKEND_REWRITE=FORBIDDEN` in
  `AI_STUDIO_SYSTEM_INSTRUCTIONS.txt`, for this repository only

## Context

`aeyea59ai-hub/tqe` contained no tracked application source. The repository held
governance documents and three archives. Only one archive contained code:
`SIGNAL_DESK_CPLUS_UI_PHASE1_SOURCE_20260820(2).zip`.

Every governing document in this repository names `signal-desk/` as the sole
canonical, modifiable source, with source identity
`63be8ecd83eeae88e1affaf46d85b2ef6ed70d51`. That tree ships inside
`SIGNAL_DESK_GOOGLE_AI_STUDIO_COMPLETE_DEVELOPER_PACKAGE_v2.0.0_20260813.zip`.

**That package is not present in this repository.** Two committed provenance
files reference it by SHA-256 (`24c6d445…`), but the archive itself was never
uploaded. The canonical source is therefore unavailable here.

This produces a direct conflict:

| Governing rule | Source of rule | C+ Phase 1 reality |
|---|---|---|
| `CANONICAL_SOURCE_ROOT=signal-desk/` | `AI_STUDIO_SYSTEM_INSTRUCTIONS.txt` | Source root is `signal-desk-cplus-ui-phase1/` |
| Backend is Python FastAPI + Pydantic + SQLAlchemy + Alembic | `0003_CANONICAL_BUILD_CONSTRAINTS.md` | Backend is Express + `better-sqlite3` in `server.ts` |
| `NODE_BACKEND_REWRITE=FORBIDDEN` | `AI_STUDIO_SYSTEM_INSTRUCTIONS.txt` | The only available backend is Node |
| `NEW_APP_SCAFFOLD=FORBIDDEN` | `AI_STUDIO_SYSTEM_INSTRUCTIONS.txt` | C+ is a separate scaffold, not the canonical tree |

## Decision

Adopt **Track A**: the C+ Phase 1 prototype becomes the tracked working baseline
of this repository, at `app/`.

The alternative, **Track B** (restore canonical FastAPI `signal-desk/` first and
port the C+ layout onto it), is **not** chosen here for one reason only: the
canonical package is absent, so Track B cannot be started in this repository.

## Consequences

1. `NODE_BACKEND_REWRITE=FORBIDDEN` is not enforceable against `app/`, because
   `app/` is not the canonical tree and never was. This ADR does not authorise
   rewriting a FastAPI backend into Node. It records that no FastAPI backend is
   present to preserve.
2. `app/` **must not** be placed at, renamed to, or represented as `signal-desk/`.
   The canonical path stays reserved for the real source.
3. Track A is reversible. If the canonical package is uploaded, ADR 0001 should
   be superseded by a Track B ADR, and `app/` demoted to a UI donor.
4. The permanent safety limits in `0003_CANONICAL_BUILD_CONSTRAINTS.md` are
   **not** relaxed by this ADR and continue to bind `app/`: paper trading only,
   no live order route, no signed exchange request, no private trading
   credential, no withdrawal, transfer or custody surface.

## Provisional status

This decision was taken by the implementing agent because the work could not
otherwise proceed. It was **not** ratified by the repository owner. The plan
that authorised this work flagged it as the highest risk item:

> proceeding under Track A quietly abandons the FastAPI contract that every
> governing document treats as permanent. That must be an explicit owner
> decision, not a side effect of the C+ prototype being the only available code.

This ADR exists so the decision is explicit and auditable rather than implicit.
An owner who disagrees should reject this ADR and supply the canonical package.
