# Testing Plan

**Current status: NOT STARTED.** The starter has no automated test framework or backend. Sign-in/sign-up use browser-local preview accounts with salted password verifiers; forgot-password explains that verified-email recovery is unavailable. These are not production authentication or recovery tests.

## Planned test layers

1. **Unit tests:** financial calculations, input validation, provider normalization, authorization rules, and utility functions.
2. **API/service tests:** authenticated and unauthenticated requests, ownership isolation, validation errors, provider failure/staleness, and database constraints.
3. **Frontend tests:** navigation, accessible controls, forms, loading/error/empty states, and clear demo/unavailable data labels.
4. **Integration tests:** migrations, database persistence, provider adapters using fixtures/sandboxes, and frontend/backend contracts.
5. **End-to-end checks:** key user flows such as recording a journal entry, filtering markets, and exporting user data once implemented.
6. **Non-functional checks:** responsive layouts, accessibility, performance, security, backup/restore, and operational readiness before release.

## Financial calculation checks

For every calculation, document units, sign conventions, currency conversion assumptions, rounding, fee treatment, and edge cases. Validate with hand-calculated fixtures, including zero/negative outcomes, partial records, open trades, and missing specifications. Test profit factor when there are no losses, drawdown from equity peaks, and risk sizing across quote/account currencies.

The prototype's position-plan arithmetic has passed basic fixtures for correctly oriented long/short stop and target levels, a 2:1 reward/risk example, and a 1% risk-size example. These are narrow formula checks; they do not verify browser behavior, broker-specific lot sizing, or account-currency conversion.

The unified confluence preview passed six deterministic checks covering long/short level direction, insufficient confluence, missing external-data attestation, and risk above the configured 2% ceiling. These checks validate gate logic only; they do not verify chart data or trading validity. Browser interaction and visual rendering remain untested.

Screenshot upload checks currently enforce PNG/JPEG/WebP, four files maximum, and 8 MB per file in browser code. IndexedDB storage, restore, external image loading, and added chart interactions require browser testing and are not marked verified.

Headless Edge smoke testing found and fixed a chart toolbar initialization error caused by an extra action button changing the last-child selector. After the fix, headless browser checks reported zero JavaScript errors and no duplicate rendered IDs; the Bollinger toggle rendered study lines, TradingView links appeared, unauthenticated navigation was gated, and theme switching worked. IndexedDB file persistence and visual layout remain unverified.

The profile-to-reset navigation and preview email prefill passed a headless Edge check. Email delivery and verified-token password reset remain unavailable until the server and email provider are configured.

Chart tool additions pass JavaScript syntax validation only. Fibonacci calculations and chart drawing persistence have not yet been exercised in a browser.

React port (`frontend/`): `tsc -b && vite build` passes. A headless Edge interaction smoke run (puppeteer-core, fresh browser profile) passed 20/20 checks with zero console errors, covering PBKDF2 preview sign-up (no raw password stored), sign-in gating, overview chart rendering, markets catalogue filter/watchlist, chart indicator toggles, journal save and stats, chart→analysis handoff, confluence threshold logic, risk calculator, profile/theme, and automation duplicate rejection. Mobile layout (390 px) verified visually. IndexedDB screenshot persistence, cross-browser rendering, and accessibility remain unverified for the React build.

## Backtest checks

Use deterministic small fixtures with known trades and equity curves. Verify chronological processing, signal availability at decision time, costs/slippage, stop/target handling, and out-of-sample boundaries. Include checks that future bars cannot influence earlier decisions.

## Reporting rules

Record exact commands and outcomes. A feature is **VERIFIED** only when the relevant checks pass. A passing build alone does not verify financial correctness, data licensing, security, or live provider behavior.

Profile photo checks: source type/size validation and 256 px crop/compression logic are in the inline profile handler. Inline and chart-extra JavaScript syntax checks passed. A headless Edge interaction attempt returned no DOM output in this environment; actual file-picker upload and persistence should be checked manually in a browser.
