# Signal Desk — Complete Google AI Studio Developer Package

**Package version:** `2.0.0`  
**Package date:** `2026-08-13`  
**Canonical working source:** `signal-desk/`  
**Canonical source identity:** `63be8ecd83eeae88e1affaf46d85b2ef6ed70d51`  
**Source-origin ZIP SHA-256:** `12764f1bcb4c21c305a93c18e35ff5dbfe924b6dd0ee87ae5ee89e74b63d28c6`  
**Current U7 status:** `BLOCKED`  
**Current U8 status:** `PENDING / NOT RELEASED`  
**Nested archives:** none  
**Encryption/password protection:** none  
**Developer-facing language:** English  
**Product UI languages:** Arabic and English

## Purpose

This is a complete continuation and reconstruction handoff for a developer to finish Signal Desk from the current source. It contains the current source, executable tests already present in that source, historical U7 evidence, rollback material, current and historical blueprints, ATM research, AI Trading Desk design, Skill Control Plane design, full-history reconstruction design, test programs, skills and release requirements.

It is **not** a fully working final application and must not be labelled U7 PASS or U8 Final Release.

## Read order

1. `01_PROJECT_STATUS_AND_DECISION_TABLE.md`
2. `02_SOURCE_AUTHORITY_AND_PRECEDENCE.md`
3. `03_PACKAGE_MAP.md`
4. `04_IMPLEMENTATION_MATRIX.md`
5. `AI_STUDIO_SYSTEM_INSTRUCTIONS.txt`
6. `AI_STUDIO_START_PROMPT.txt`
7. `developer-handoff/04_EXECUTION/01_MASTER_BUILD_FROM_START_TO_FINISH_AND_RUN_ALL_TESTS.md`
8. `MASTER_DEVELOPER_EXECUTION_PROMPT.md`
9. Main, ATM, AI Trading Desk, Skill Control Plane and reconstruction blueprints.
10. `baseline-evidence/U7/U7_REPORT.md` and current source tests.

## Mandatory source rule

Modify only `signal-desk/`. Every directory under `reference-only/` is historical, donor, rollback or source-language evidence and must not replace the canonical source.

## Google AI Studio note

The ZIP places `signal-desk/`, `developer-handoff/`, `blueprints/`, `skills/`, `baseline-evidence/`, `reference-only/` and `99_RELEASE/` directly at archive root. If Google AI Studio still reports that these paths do not exist, the service did not expand the ZIP into its workspace. File size, encryption or nested archives are not the cause; use an extracted repository import workflow for execution.
