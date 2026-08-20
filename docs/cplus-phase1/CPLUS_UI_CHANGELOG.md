# C+ UI CHANGELOG

## Added
- Desktop `AppSidebar`.
- Clean `GlobalHeader`.
- Mobile navigation drawer.
- C+ navigation registry and page metadata.
- C+ market/asset/scanner/paper/provider workspace layouts.

## Changed
- Dashboard is now a true overview.
- Markets is now the discovery and market-selection surface.
- Scanner uses filter rail + candidate list + inspector.
- Asset-specific context is restricted to Asset/Decision pages.
- Trade Plan and Paper Trading have dedicated workspace structures.
- AI provider settings emphasize local Termux/Ollama use.
- AI Chat is less intrusive and responsive.

## Removed from mounted global shell
- Permanent `BTCUSDT SELECT`.
- Full tab strip.
- Paper balance/status clutter.
- Mixed page-specific controls.

## Not changed
- Backend routes.
- Scanner calculations.
- Strategy logic.
- Risk logic.
- Paper engine.
- Backtester.
- Database.
- AI request/decision logic.
