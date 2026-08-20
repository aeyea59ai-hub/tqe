# ADR 0004 — Blueprint archive retention

- **Status:** Accepted
- **Date:** 2026-08-20

## Context

Three archives sit at the repository root:

| Archive | Size | Contents |
|---|---:|---|
| `SIGNAL_DESK_FULL_BLUEPRINT_NUMBERED_MARKDOWN_EN_v3.0.0_20260813.zip` | 26.0 MB | 71 markdown volumes (documentation only) |
| `SIGNAL_DESK_CONTINUOUS_BUILD_BLUEPRINT_MARKDOWN_EN_v4.0.0_20260814(1).zip` | 0.21 MB | 111 numbered specifications |
| `SIGNAL_DESK_CPLUS_UI_PHASE1_SOURCE_20260820(2).zip` | 0.19 MB | The C+ Phase 1 source |

The originating plan flagged the 26 MB archive as clone-size bloat.

## Decision

**Retain all three archives in the repository, unchanged, for now.**

## Rationale

1. Deleting a blob from the working tree does **not** shrink a clone. The object
   already exists in commit `6388d3d` and is fetched by every full clone
   regardless. Removing it would cost the provenance and buy nothing without a
   history rewrite, which is out of scope and destructive to a shared branch.
2. The C+ source archive is the integrity reference for `app/`. Phase 1 used its
   `CPLUS_UI_FILE_MANIFEST.json` and `CPLUS_UI_CHECKSUMS.sha256` to prove that no
   file was altered in transit. Deleting it would remove the ability to re-verify.
3. The blueprint archives are the only copy of the requirements in this
   repository, and the canonical developer package is already missing. Reducing
   redundancy further would be the wrong direction.

## Consequences

- Clone size stays ~32 MB. Accepted deliberately.
- Verified provenance: `SIGNAL_DESK_FULL_BLUEPRINT_…v3.0.0.zip` SHA-256 was
  recomputed as `10a8c86f2ed9970cc494f5e2c753d38816ffdd193a92726c7ff0286ba86da440`
  and matches its committed `.sha256.txt`.
- If clone size later becomes a real constraint, the correct remedy is moving
  the archives to a GitHub Release **and** rewriting history — one deliberate
  operation, not a working-tree deletion.
