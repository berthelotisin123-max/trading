# Changelog

Notable project changes are recorded here. The planning entries do not imply product features were implemented.

## Unreleased

- Added `frontend/`: a React 19 + TypeScript + Vite port of the complete prototype (design tokens, responsive app shell with mobile section nav, hash routing, route gating, and a toast system). Feature parity with the static prototype: welcome/sign-in/sign-up/reset pages, PBKDF2 browser-local preview auth, overview, markets catalogue with persisted watchlist, illustrative candle/line charts with SMA 20/EMA 9/Bollinger 20/RSI 14, crosshair, manual levels, Fibonacci, position plans, zones, trendlines, SVG export and alert drafts, chart→analysis handoff, confluence lab with screenshot attachments (IndexedDB), journal with CSV export and attachments, risk calculator, backtest configuration, automation guardrail drafts with duplicate detection, investments, and profile with photo upload, theme, and logout.
- Verified the React app with a headless Edge smoke run: 20/20 interaction checks passed with zero console errors. `tsc -b && vite build` passes.
- The static prototype remains at the repository root as the no-build reference implementation.

- Added profile photo upload, resize, browser-local persistence, removal, and header avatar display. Existing analysis screen supports locally saved screenshot attachments.

- Added a unified manual confluence review combining supply/demand, price action, SMC, ICT, liquidity, imbalance/block evidence, and risk checks. It shows a threshold result but does not claim a validated signal.
- Added a chart-to-analysis action that carries the selected chart symbol and timeframe into the confluence form.
- Added a profile/preferences page with local name setting, dark/light theme controls, and preview logout.
- Added an “Analyze this chart” action to the dashboard overview chart as well as the Charts page.
- Added browser-local screenshot attachments for analysis notes and an explicit AI-unavailable state; no image or plan is sent to a service.
- Added Bollinger 20 and RSI 14 overlays, interactive crosshair, manual supply/demand zones and trendlines, and TradingView links for selected symbols.
- Added distinct Unsplash photo backgrounds for welcome, sign-in, and sign-up pages, with source credits.
- Fixed chart extras initialization by selecting the last chart tool group rather than relying on the toolbar's final child; headless Edge smoke checks now pass.
- Removed a duplicate public-page CSS block that had been placed outside the `<style>` element and appeared as stray page text.
- Added a direct password-reset link from Profile & preferences and prefilled the reset email from the sign-in field or current preview-account email.
- Persisted preview-account verifier records in the current browser, redirected successful sign-ups to sign-in, synced the registered name/email into Profile, and added dark/light theme icons.
- Added an original BETZO welcome page with an inline market-analysis illustration and a demo workspace entry.
- Added browser-local account preview with sign-in gating, strong-password requirements, confirmation, and forgot-password guidance. This is not production authentication and cannot send email resets.
- Expanded chart symbol selectors to use the deduplicated instrument catalogue.
- Added SMA 20 and EMA 9 overlays, manual horizontal analysis levels, SVG chart export, and local-only alert drafts to both chart workspaces.
- Added locally saved Fibonacci retracement levels and long/short entry, stop, and target plan drawings.
- Added a local trade setup planner with directional stop/target validation and reward/risk arithmetic; it does not generate a trading signal.
- Added automation guardrail drafts and signal-intent validation with duplicate detection and mandatory human review; broker execution remains disabled.
- Replaced overview's line illustration with interactive illustrative candlestick/line charts and interval controls; added a dedicated Charts workspace.
- Added a position risk estimate calculator with explicit unit-value assumptions and direction-aware stop/target validation.
- Added trading journal search and CSV export.
- Added spread, commission, slippage, and rule-description fields to backtest configuration; the prototype still does not execute backtests.
- Persisted manually added portfolio rows in browser local storage.
- Changed the prototype's primary accent from green to blue.
- Expanded the Markets page with a searchable, filterable reference catalogue, source attribution, and a locally saved watchlist control.
- Added forex, metals, energy, index, stock, ETF, bond, crypto, agriculture, synthetic, derivative, money-market, and REIT examples from public source pages.
- Clearly labelled the catalogue as static reference data; no prices or provider availability are asserted.
- Added Weltrade's published SyntX families and variants to the reference catalogue.
- Added a News & Calendar page with fundamental, breaking, and technical news categories, source links, and disconnected-feed states.
- Inspected the requested Shora app route; it returns HTTP 403 to the available browser and its in-app appearance could not be confirmed.
- Added Phase 0 architecture, roadmap, schema, API, integration evaluation, security, testing, and progress documentation.
- Documented the existing static prototype's limitations and proposed next steps.
- No application code or dependencies changed.
