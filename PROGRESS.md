# BETZO Progress

## Current overall state

**Phase 0: IMPLEMENTED. Phase 1: IN PROGRESS** — the prototype now exists in two interchangeable forms: the original static page (`index.html`) and a full React 19 + TypeScript + Vite port in `frontend/` with the same features, verified by a headless-browser smoke run. It remains without production authentication, live feeds, AI provider, broker, or backend.

## Completed

- [x] Inspected the starter files and identified the static HTML/CSS/JavaScript stack.
- [x] Recorded known prototype behavior and limitations.
- [x] Proposed an incremental frontend/backend/database architecture.
- [x] Drafted roadmap, schema plan, API plan, integration criteria, and security/testing plans.
- [x] Preserved the existing prototype files.
- [x] Replaced green primary accents with blue in the existing prototype.
- [x] Added a searchable/filterable example instrument catalogue with source labels.
- [x] Added browser-local watchlist toggles on the Markets page.
- [x] Added Weltrade SyntX examples: FX Vol./SFX Vol., PainX/GainX tick variants, FlipX, SwitchX, BreakX, TrendX, PlusX 1, FiboX, QuadX, and MAX PainX/GainX.
- [x] Added news category descriptions and direct Forex Factory News/Calendar source links without copying article text or implying a live feed.
- [x] Added candle/line chart type and timeframe controls to the overview and Charts workspace.
- [x] Added direction-aware position risk estimate and explicit calculation assumptions.
- [x] Added journal filtering and CSV export.
- [x] Persisted manually added holdings in browser local storage.
- [x] Added transaction-cost assumptions and rule-description fields to backtest configuration without claiming a backtest runs.
- [x] Added SMA 20/EMA 9 chart overlays, manual price levels, Fibonacci retracement lines, long/short entry-stop-target drawings, SVG export, and local alert drafts.
- [x] Added local trade-plan structure checks and reward/risk arithmetic without claiming AI analysis or confirmed signals.
- [x] Added local automation guardrail settings, signal-intent checks, duplicate prevention, and mandatory human approval; no orders are sent.
- [x] Added a branded public welcome page and sign-in/sign-up previews that never send raw credentials to a server.
- [x] Added browser-persistent preview sign-up/sign-in with password rules (8+ characters, upper/lowercase, number, special character), sign-in gating for workspace routes, and a password-recovery page that clearly reports email reset is not connected.
- [x] Expanded chart symbol selection to the static reference catalogue.
- [x] Added one confluence workspace for supply/demand, price action, SMC, ICT, liquidity, FVG/order-block evidence, and risk checks.
- [x] Added a chart-to-confluence handoff that carries the selected instrument and timeframe.
- [x] Added a profile/preferences page, browser-local dark/light theme setting, and logout action.
- [x] Added local screenshot attachments with image-type/size limits and TradingView links from chart and analysis views.
- [x] Added Bollinger 20, RSI 14, crosshair, supply/demand zone, and trendline chart tools to the illustrative chart.
- [x] Added distinct Unsplash photo backgrounds to welcome, sign-in, and sign-up pages with source links.
- [x] Added a React 19 + TypeScript + Vite frontend in `frontend/` with BETZO design tokens, a responsive reusable app shell (sidebar, top bar, mobile section nav, avatar, breadcrumb, toast system), and hash routing.
- [x] Ported the full prototype to React: welcome/login/signup/reset (PBKDF2 preview auth, route gating), overview, markets catalogue with watchlist persistence, interactive charts (candle/line, SMA 20, EMA 9, Bollinger 20, RSI 14, crosshair, price levels, Fibonacci, long/short position plans, supply/demand zones, trendlines, SVG export, alert drafts, TradingView links), news source page, risk calculator, journal (CSV export, filter, IndexedDB screenshot attachments), confluence lab (checklist, setup planner, unified review, screenshot attachments, chart→analysis handoff via query params), backtest configuration, automation guardrail drafts with duplicate detection, investments with local persistence, and profile/theme/logout with photo upload.
- [x] Verified the React app with `tsc -b && vite build` and a 20-check headless Edge interaction smoke run (sign-up→sign-in→workspace, catalogue filter, watchlist toggle, chart tools, journal save, confluence handoff, risk calculation, theme switch, duplicate rejection) with zero console errors.

## Not started

- [ ] Remaining module page foundations for calendar, news, education/community, and remaining product areas (as live, authorized data becomes available).
- [ ] FastAPI backend, PostgreSQL, migrations, authentication, and authorization (scaffold exists under `backend/`; Phase 2).
- [ ] Licensed market, calendar, or news providers.
- [ ] Production-grade journal, risk, backtesting, and portfolio calculations.
- [ ] AI, broker, Telegram, community, and education functionality.
- [ ] Automated unit/integration test framework and CI/deployment infrastructure.

## Checks performed for this task

- Read-only inspection of project files and existing README.
- Confirmed there are no application test scripts or dependency manifests in the static starter.
- JavaScript syntax check for the inline script passed with `node --check`.
- Hand-calculated fixture checks passed for long/short stop-target direction, 2:1 reward/risk, and 1% risk sizing (10,000 balance, 2-unit stop distance gives 50 units at unit value 1).
- Shora `/app` could not be visually inspected because the request returned HTTP 403; indexed public RNIT portal text does not confirm that route's exact design.
- No browser rendering, interaction, or responsive visual check was available/run; runtime controls are not marked verified.
- No application tests run; documentation-only changes do not establish feature correctness.

## React + TypeScript port checks

- `npm run build` in `frontend/` (`tsc -b && vite build`) passes cleanly.
- Headless Edge (puppeteer-core) interaction smoke run: 20/20 checks passed with zero console errors — preview sign-up redirects to sign-in, salted PBKDF2 verifier persisted without the raw password, workspace route gating, overview chart candle rendering, markets catalogue render (100+ rows) and local watchlist toggle, chart toolbar indicator toggles, journal trade save and stats update, chart→analysis handoff carrying symbol/timeframe, confluence 6/6 threshold result, risk calculator default scenario, profile email load, dark/light theme switch, automation guardrail duplicate rejection.
- Screenshot review confirmed the welcome, overview (dark and light), markets, confluence analysis, and mobile (390 px) layouts render correctly; the Unsplash backgrounds and inline SVG illustration load.
- IndexedDB screenshot attachment paths (journal and analysis) are implemented but not yet exercised in a browser; Firefox/Safari rendering, accessibility audit, and screen-reader behavior remain unverified.

## Authentication UI follow-up

- Inline JavaScript syntax and representative password-rule checks passed after adding the sign-in gate, password requirements, session-scoped preview verifier, and reset page.
- Browser interaction smoke checks later verified the sign-up, sign-in, profile autofill, TradingView chart links, and theme icons. Preview auth is not a secure account system; production authentication, verified email, and password reset require the backend phase and an email delivery provider.

## Confluence and profile follow-up

- Combined confluence score threshold is based only on user-checked evidence (5 of 6 checklist items), directional entry/stop/target validity, a 2% preview risk ceiling, and user attestation that they checked an external current chart. It never claims BETZO independently verified that data.
- Preview account email and name are stored in browser local storage with a salted password verifier. Logout clears only the session sign-in flag; the saved account can be used to sign in again in the same browser.
- JavaScript syntax check passed after the changes. Browser rendering and interaction checks are still pending.
- JavaScript syntax check and six deterministic confluence/risk guard cases passed. Source checks confirm both chart handoffs and the profile/theme/logout controls are present. Headless Edge account-flow smoke check passed: sign-up redirects to login, credentials persist without storing a raw password, later sign-in succeeds, and the profile loads the registered email/name.

## Runtime error fix

- Fixed a chart toolbar initialization error: the overview toolbar had an extra chart-analysis button, so selecting its last child as a tool group returned `null`. The extra chart tools now select the last actual tool-group element.
- Headless Edge smoke checks passed with zero JavaScript errors and no duplicate rendered IDs. Checks covered the welcome route, screenshot and AI panels, three TradingView links, chart study toggle/rendering, unauthenticated route gating, and dark/light theme changes.
- Browser visual review and screenshot persistence through IndexedDB still need manual checking.
- Removed the pasted duplicate background CSS from outside `</style>`; headless Edge confirmed there is no CSS text in the page body and all three photo backgrounds resolve from the stylesheet.
- Added a profile-to-password-reset link and reset-email prefill. Headless Edge verified the profile action opens the reset route and fills the current preview-account email.
- Preview account records now persist in browser `localStorage` as salted PBKDF2 verifiers (never raw passwords). Sign-up redirects to sign-in; profile name and email load from the saved account. Theme choices now include icons.
- Screenshot persistence uses browser IndexedDB and has not been tested in a browser. AI remains unavailable because no server-side provider is configured. Chart overlays operate on illustrative bars only.

## Next development step

Phase 1 is largely complete with the React/TypeScript port. Before Phase 2, visually review both frontends in a real browser, then evaluate provider terms and the Phase 2 backend scope (FastAPI + PostgreSQL + migrations + production auth) before connecting licensed data or the backend to the React app. Keep sample/reference data clearly labelled.


## Profile photo and image upload follow-up

- Added a profile photo selector with PNG/JPG/WebP validation, 8 MB source limit, square resize/compression, local persistence, preview, removal, and display in the header avatar.
- Existing analysis workspace supports up to four PNG/JPG/WebP screenshots (8 MB each), with local IndexedDB persistence when saving an analysis. No upload leaves the browser.
- Inline JavaScript and chart-extras.js syntax checks passed. Headless Edge could not return a DOM in this environment during the attempted photo interaction smoke test, so browser interaction is not marked verified.
