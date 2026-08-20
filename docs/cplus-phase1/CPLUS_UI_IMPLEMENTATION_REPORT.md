# SIGNAL DESK C+ UI REDESIGN — PHASE 1 IMPLEMENTATION REPORT

**Date (UTC):** 2026-08-20T04:05:02.874136+00:00  
**Input archive:** `v1-main.zip`  
**Input SHA-256:** `61aaa5b1ef20e9c4105dff60e0b759fc7cfe4aa9845c8f7d52047c220b234113`  
**Accepted direction:** `C+ = Hybrid Exchange Workspace (C) + Modern Terminal Pro styling (A) + Clean Analyst mobile behavior (B)`

## Scope

This phase modifies the **existing `v1-main` React UI only**.

It does not claim to fix or replace the current server, scanner, strategy, risk, backtest, paper-account or AI decision logic. The source audit previously identified business-logic defects in this prototype; those paths remain outside this UI-only phase.

## Implemented C+ surfaces

### Application shell
- Added a text-labeled desktop left sidebar.
- Added collapsible desktop navigation.
- Added a mobile full-height navigation drawer.
- Added a simplified mobile bottom navigation.
- Replaced the crowded global Header with a clean page header.
- Removed the global fixed-symbol selector from the mounted application shell.
- Symbol context now appears only on focused symbol/decision pages.

### Dashboard
- Converted the Dashboard into a market-wide overview.
- Kept only compact paper-account context.
- Removed embedded Paper Terminal and AI Council surfaces from Dashboard.
- Added direct routes into Scanner, Decisions, Markets, Paper and Providers.
- Collapsed duplicate top-opportunity rows by `symbol + direction`.

### Markets
- Converted Markets into the primary discovery and symbol-selection workspace.
- Added search, favorites and market filters.
- Added a market preview inspector.
- Removed direct paper-order action from the Markets UI.
- Opening a market now routes naturally to Asset Workspace.
- Made the market picker full-height on mobile.

### Asset Workspace
- Added a C+ contextual rail and right-side market inspector.
- Separated Chart, Structure, Technical, Derivatives, Decision Context and AI Review.
- Kept paper-account information compact and routed outward.
- Moved full plan review to the dedicated Trade Plan workspace.

### Scanner
- Added C+ filter rail, dense candidate table and right-side inspector.
- Groups the displayed list by `symbol + direction`.
- Shows the best candidate as the primary row.
- Exposes additional strategy matches in expandable alternatives.
- Shows `RESEARCH ONLY` for symbols outside the current BTC/ETH publishable policy.
- Retains the existing scanner payload and callbacks without changing scanner calculations.

### Trade Plan
- Added dedicated plan geometry, target, risk and cost panels.
- Kept simulated execution only on the Trade Plan page.
- Preserved the existing plan and RiskEvaluation values.

### Paper Trading
- Separated Overview, Open Positions, Order History and Journal within a dedicated Paper workspace.
- Added a persistent `PAPER ONLY` safety identity.
- Kept Dashboard paper information to a compact summary.

### AI provider settings
- Added C+ provider registry, routing rail and provider inspector.
- Made Ollama Local / `127.0.0.1:11434` visually prominent for the future Termux runtime.
- Preserved the existing provider endpoints and request behavior.

### AI chat
- Made the launcher less intrusive.
- Made the chat panel responsive on mobile.
- Removed hard-coded visible Gemini branding in favor of configured-provider wording.
- Did not change AI request logic.

## Source-change boundary

Modified existing files:

- `src/App.tsx`
- `src/components/AIChatDrawer.tsx`
- `src/components/AssetWorkspace.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/DashboardHome.tsx`
- `src/components/MarketPickerModal.tsx`
- `src/components/MarketsPage.tsx`
- `src/components/MobileBottomNav.tsx`
- `src/components/MultiStageScanner.tsx`
- `src/components/PaperTradingDesk.tsx`
- `src/components/SettingsProviders.tsx`
- `src/components/TradePlanDesk.tsx`
- `src/index.css`

Added files:

- `src/components/shell/AppSidebar.tsx`
- `src/components/shell/GlobalHeader.tsx`
- `src/components/shell/MobileNavDrawer.tsx`
- `src/components/shell/navigation.ts`

Deleted files: `0`.

No files under these business/domain paths were changed:
- `server.ts`
- `src/lib/`
- `src/types/`
- `package.json`
- `package-lock.json`

## Validation evidence

### PASS — archive/source boundary
Only `src/App.tsx`, `src/index.css`, and UI component files differ from the input archive.

### PASS — TypeScript/TSX syntactic transpilation
- Files parsed/transpiled: `46`
- Syntax diagnostics: `0`
- Method: TypeScript `transpileModule`, ES2022 + React JSX.

### PASS — UI contract type check
A temporary ambient-declaration harness checked the application UI and internal component props:
- Result: `0` TypeScript diagnostics.
- Scope: `src/**/*.ts` and `src/**/*.tsx`, excluding existing test files.
- Limitation: this is not a replacement for the project's real dependency-backed `npm run lint`.

### PASS — C+ static acceptance checks
- Desktop sidebar mounted.
- Clean GlobalHeader mounted.
- Legacy Header not mounted.
- No `BTCUSDT SELECT` in mounted global shell.
- Context symbol restricted to focused pages.
- Dashboard no longer mounts Paper/Quant/AI workspaces.
- Markets does not expose direct paper execution.
- Scanner groups by symbol/direction.
- Alternative matches present.
- Paper workspace separated.
- Ollama Local visible in provider settings.
- No domain/business files changed.

### BLOCKED — dependency-backed build/test
`npm ci` could not complete because the current environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`). The available Node runtime is `v22.16.0`; the lock currently also warns that `jsdom@30.0.1` and `undici@8.10.0` require a newer Node 22 patch or another supported runtime.

Therefore these were **not** claimed as PASS:
- `npm run lint`
- Vite production build
- Vitest
- Browser rendering
- Screenshot fidelity comparison
- Mobile interaction E2E

## Known limitations retained deliberately

- The existing `v1-main` scanner/data/strategy/risk/paper/backtest logic remains unchanged.
- Previously identified random/synthetic business data paths remain present.
- This UI source is not a replacement for the canonical React/FastAPI Signal Desk repository.
- Local AI is not installed by this UI phase; the UI prepares the provider workspace only.
- The unused legacy `src/components/Header.tsx` remains in the archive for compatibility but is not mounted by `App.tsx`.

## Verification commands when dependencies are reachable

```bash
npm ci --no-audit --no-fund
npm run lint
npm run build
```

Then verify desktop and mobile navigation, Dashboard separation, market selection, Asset Workspace, Scanner inspector, Paper workspace and AI provider settings in a real browser.
