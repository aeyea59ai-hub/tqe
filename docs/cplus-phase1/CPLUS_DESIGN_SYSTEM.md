# SIGNAL DESK C+ DESIGN SYSTEM

## Formula

- **Workflow and workspace model:** Hybrid Exchange Workspace (Concept C)
- **Visual language:** Modern Terminal Pro (Concept A)
- **Mobile interaction:** Clean Analyst Workspace (Concept B)

## Core tokens

| Token | Value |
|---|---|
| App background | `#060A11` |
| Shell surface | `#080C14` |
| Primary panel | `#0A0F19` |
| Secondary panel | `#0B101A` |
| Border | Tailwind `slate-800` |
| Text | `slate-100` |
| Muted text | `slate-500/600` |
| Context/action | `cyan-300/400` |
| LONG/positive | `emerald-300/400` |
| SHORT/negative | `rose-300/400` |
| Warning/research | `amber-300/400` |
| AI context | `violet-300/400` |

## Container model

Prefer:
- sidebars;
- rails;
- tables;
- inspectors;
- open workspaces;
- drawers;
- bottom sheets.

Avoid:
- repeated oversized cards;
- a global locked symbol control;
- paper execution inside market discovery;
- multiple full workspaces embedded in Dashboard.

## Desktop shell

- Sidebar expanded: `248px`.
- Sidebar collapsed: `72px`.
- Header: `64px`.
- Main max width: `1900px`.
- Context rail: approximately `220–250px`.
- Inspector: approximately `300–330px`.

## Mobile shell

- Header: compact single row.
- Bottom navigation: Home / Markets / Scanner / Paper / More.
- Full navigation: left drawer.
- Market picker: full-height sheet.
- Inspectors: stacked below content or future bottom-sheet treatment.
- AI launcher sits above mobile navigation.

## Symbol context rule

Global pages do not show a fixed selected coin:
- Dashboard
- Markets
- Scanner
- Paper
- Strategy Lab
- Settings

Focused pages may show contextual symbol:
- Asset Workspace
- Agent Council
- Trade Plan

## Paper separation

Paper Trading is its own workspace with:
- Overview
- Open Positions
- Order History
- Journal

Dashboard shows only a compact, non-interactive summary.

## Accessibility baseline

- Text labels accompany navigation icons.
- `focus-visible` outline is global.
- Status uses text plus color.
- Mobile targets are approximately 44px or greater.
- Reduced-motion preference disables non-essential transitions/animations.
