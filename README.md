# BETZO Financial Intelligence

BETZO is planned as a modular financial intelligence workspace for market research, trading journals, risk analysis, portfolio tracking, and related tools. The current project is a browser-only prototype; this document describes its actual state and the proposed development direction.

## Current project status

- **Frontends:** two. The original single-page static prototype remains at `index.html` (browser-only, no build). A new **React 19 + TypeScript + Vite** application lives in `frontend/` and ports the full prototype: welcome/sign-in/sign-up/reset, sign-in-gated workspace, overview, markets catalogue, charts with illustrative candles/indicators/drawings, news source links, risk calculator, journal with screenshots, confluence lab, backtesting configuration, automation drafts, investments, and profile/theme/logout. It is verified by an automated headless-browser smoke run (see TESTING.md).
- **Primary accent:** blue (replacing the original green); red remains for negative movement.
- **Available prototype areas:** overview, markets, charts, news/calendar source links, risk calculator, trading journal, ICT/SMC analysis, backtesting configuration, automation roadmap, and investments.
- **Public entry screens:** an original welcome page, sign-in/sign-up preview, and password-recovery preview. Workspace routes are gated behind sign-in. Preview accounts store a salted PBKDF2 verifier in `localStorage` so the same browser can sign in later; raw passwords are not stored. This is not production authentication and has no verified email or reset service.
- **Chart selector:** expanded to the instrument reference catalogue. All chart bars remain illustrative until an authorized data feed is integrated.
- **Confluence workspace:** combines manual supply/demand, price-action, SMC, ICT, liquidity, FVG/order-block, and risk checklist evidence. Users can open it from a selected chart; it does not detect patterns or emit validated trade signals.
- **Screenshots and chart tools:** attach up to four chart screenshots to a locally saved analysis; charts include crosshair, Bollinger 20, RSI 14, manual supply/demand zones, trendlines, and direct TradingView links. Bars remain illustrative; AI screenshot review is not connected.
- **Profile:** browser-local profile photo upload (PNG/JPG/WebP, max 8 MB; resized before saving), name, email, dark/light preference, and sign-out. Profile photo appears in the workspace avatar. Settings are not synced to an account server.
- **Public page photography:** welcome, sign-in, and sign-up backgrounds load from Unsplash and require an internet connection; image source links are shown on the welcome page.
- **Markets catalogue:** searchable examples across forex pairs, metals, energy, indices, equities, ETFs, bonds, crypto, agriculture, synthetic instruments, derivatives, money markets, and REITs. Each row is marked as reference metadata with no live feed.
- **Theme:** dark workspace with blue primary accents; red remains for negative movement.
- **Persistence:** journal records and analysis notes use browser `localStorage`; portfolio additions last only for the current page session.
- **External services:** none. There are no live quotes, authentication, backend, database, AI service, broker, Telegram, or MT4/MT5 connection.
- **Data integrity:** prototype prices and metrics are illustrative and are labelled as such. No trades are executed.
- **Tooling:** `frontend/` uses npm with Vite and TypeScript (`tsc -b && vite build`); the static prototype has no build step. No Git repository, CI, or automated unit-test framework is configured yet; browser interaction checks are recorded in TESTING.md.

Do not treat prototype sample values as market data or the prototype as a production financial service.

## Run the current prototype

**Static prototype (no build):** open `index.html` in a modern browser. No build is required.

**React + TypeScript app (`frontend/`):**

```powershell
cd frontend
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to frontend/dist
npm run preview  # serve the production build locally
```

Preview sign-up uses Web Crypto, so if your browser blocks cryptography for a local file, serve the app from `localhost` (the dev/preview servers above do this automatically). Preview account email, name, and a salted password verifier persist in this browser only; sign-in state ends with the tab session. Successful sign-up returns to sign-in, where the saved account can sign in later. Profile loads the registered name and email. This local preview is not production authentication and does not sync across devices.

## Proposed target architecture

- React, TypeScript, and Vite frontend, introduced incrementally.
- Python/FastAPI REST backend, organized by product domain.
- PostgreSQL with migrations and user-scoped records.
- Provider adapters on the backend for market, calendar, and news data.
- WebSockets only for product needs that require real-time updates and after an authorized feed is selected.
- Additional infrastructure such as Redis, workers, Docker, and CI when justified by implementation needs.

See [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md), and [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for plans. These are proposals, not implemented systems.

## Development status

Phase 0 planning documents have been created, and the prototype has received iterative UI and interaction updates. See [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) and [PROGRESS.md](PROGRESS.md) for current status and the proposed sequence.

## Development principles

- Clearly identify demo, manual, delayed, live, and unavailable data.
- Use authorized data sources and display provenance and timestamps where available.
- Keep secrets and provider credentials on the backend.
- Prefer read-only integrations and demo environments; real-money execution is outside the initial product scope.
- Verify calculations with known examples before marking them verified.
- Keep user records private and enforce authorization on the server.
- Do not claim a planned feature is implemented or tested.

## Important limitations

BETZO is not financial advice and the prototype does not provide brokerage, custody, portfolio execution, or live trading functionality. Commercial data use, regulated activities, privacy, and security requirements must be reviewed before launch.
