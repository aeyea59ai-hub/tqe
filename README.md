# Signal Desk — C+ UI working baseline

Local-first crypto futures intelligence, strategy research and **paper-trading-only**
research workstation.

> **Paper trading only.** There is no live order route, signed exchange request,
> private trading credential, withdrawal, transfer or custody surface in this
> repository, and none may be added.

## Status — read this first

| Question | Answer |
|---|---|
| Is there tracked application source? | **Yes**, at [`app/`](app/) |
| Is `app/` the canonical `signal-desk/` tree? | **No** |
| Is the canonical developer package present? | **No** — see [ADR 0003](docs/adr/0003-release-status.md) |
| Can anything here be labelled U7 PASS? | **No** |
| Can anything here be labelled U8 Final Release? | **No** |
| Is this a finished application? | **No** |

`app/` is the **C+ UI Phase 1 prototype**, adopted as the working baseline under
[ADR 0001](docs/adr/0001-architecture-track.md) because it is the only source
available in this repository. It is a Node/Express + React prototype, **not** the
contracted Python/FastAPI architecture.

## Repository layout

```
app/                    C+ Phase 1 application source (tracked, buildable)
  src/                  React 19 + TypeScript UI, domain libs, types
  test/                 Vitest suites and deterministic fixtures
  server.ts             Express API + Vite middleware / static host
docs/
  adr/                  Architecture decision records
  cplus-phase1/         Preserved C+ Phase 1 design, changelog and QA evidence
  VERIFICATION_EVIDENCE.md   Recorded results of each verification gate
  STRUCTURAL_DEBT.md    Scheduled, explicitly-tracked remaining work
.github/workflows/      CI: install -> lint -> build -> test
*.zip                   Blueprint and source archives (see ADR 0004)
*.md, *.txt             Package governance documents
```

## Quick start

Requires **Node >= 22.18.0** (`jsdom@30` and `undici@8` need a Node 22 patch
newer than 22.16.0; that mismatch is what blocked the original Phase 1).

```bash
cd app
npm ci --no-audit --no-fund
npm run lint     # tsc --noEmit
npm test         # vitest run
npm run build    # vite build + esbuild server bundle
npm start        # serve the production build
```

`npm run dev` runs the Express server with Vite middleware attached. The server
binds `127.0.0.1` by default; set `HOST` to override that deliberately.

### Safety guards

```bash
node scripts/check-forbidden-surfaces.mjs   # TC-SEC-001 paper-trading-only scan
node scripts/check-determinism.mjs          # no fabricated data on decision paths
```

Both run in CI on every push. Verified results are recorded in
[`docs/VERIFICATION_EVIDENCE.md`](docs/VERIFICATION_EVIDENCE.md).

### Configuring an AI provider

`secret_ref` is an **indirection only**, of the form `env:NAME`. Inline API keys
are rejected at the API boundary and are never written to the database. Export
the credential in the environment and reference it by name:

```bash
export GEMINI_API_KEY=...            # then use secret_ref "env:GEMINI_API_KEY"
```

Outbound provider hosts are restricted to loopback (for Ollama and llama.cpp)
plus an owner-approved allow-list. Approve an additional host with
`SIGNAL_DESK_PROVIDER_ALLOWED_HOSTS=host.example`.

## Architecture decisions

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-architecture-track.md) | Track A — C+ prototype is the working baseline (provisional) |
| [0002](docs/adr/0002-design-system-direction.md) | C+ design system retained as an interim step toward Quiet Grid Terminal (provisional) |
| [0003](docs/adr/0003-release-status.md) | U7 / U8 cannot be claimed in this repository |
| [0004](docs/adr/0004-archive-retention.md) | Blueprint archives retained in-tree |
| [0005](docs/adr/0005-fabricated-data-policy.md) | Fabricated data is forbidden on a decision path, enforced in CI against a shrinking baseline |
| [0006](docs/adr/0006-provider-gateway-security.md) | AI provider gateway security posture — SSRF containment, secret indirection, input validation, non-leaking errors |

ADRs 0001 and 0002 are **provisional**: they were taken by the implementing agent
so work could proceed, and they have not been ratified by the repository owner.

## Known limitations

Tracked in [`docs/STRUCTURAL_DEBT.md`](docs/STRUCTURAL_DEBT.md). The largest
items: paper state is browser-local with no hash-chained journal, there is no
database migration tool, the UI is English-only against an Arabic + English
contract, navigation uses string page-ids rather than real routes, and the design
system has not converged on Quiet Grid Terminal.

Two are guarded rather than fixed: 24 `Math.random()` call sites still sit on
decision paths (SD-06), and the anti-skip test gate is still failing with no
component, route, endpoint or flow coverage (SD-07). Both have CI checks that
stop them getting worse.
