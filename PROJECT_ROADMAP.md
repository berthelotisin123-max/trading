# BETZO Development Roadmap

This roadmap follows the product owner's requested order. Status describes the inspected workspace at the time these documents were prepared; a plan is not evidence of implementation.

## Phase 0 — Project audit and planning

**Status: IMPLEMENTED** — initial read-only audit and planning baseline documented. No application code changed. Provider selection, detailed product requirements, and design choices remain open.

- [x] Inspect the starter files and identify its current stack and limitations.
- [x] Record proposed architecture, database domains, API boundaries, risks, and evaluation criteria.
- [ ] Agree on the next implementation scope before major code changes.

## Phase 1 — Professional frontend foundation

**Status: IN PROGRESS** — blue-accent styling, a searchable reference instrument catalogue, news/calendar source page, illustrative candle/line charts, basic risk estimate, journal export/search, and cost-assumption fields have been added to the existing prototype. The React/TypeScript shell and remaining module foundations are not started.

- Establish original BETZO branding and design tokens.
- Build a responsive navigation shell and reusable accessible UI components.
- Create substantive module page foundations for the full product scope.
- Keep unavailable data and unimplemented functionality explicit.
- Review layouts at desktop, tablet, and mobile sizes.

## Phase 2 — Authentication and backend foundation

**Status: NOT STARTED**

- Establish FastAPI and PostgreSQL project structure and migrations.
- Implement secure authentication, authorization, validation, and error handling.
- Connect the frontend through a typed API client.
- Add targeted automated tests before marking features verified.

## Phase 3 — Markets and charting

**Status: NOT STARTED**

- Define instrument categories, provider-neutral models, search, and watchlists.
- Evaluate chart libraries and data providers, including licensing and commercial-use terms.
- Connect an authorized provider before presenting data as live or delayed market data.
- Add historical charting, provenance, timestamps, and unavailable states.

## Phase 4 — Economic calendar and news

**Status: NOT STARTED**

- Select authorized sources; implement attribution, event filtering, timezone handling, freshness, and failure states.
- Respect article and data licensing; distinguish summaries from source content.

## Phase 5 — ICT/SMC analysis

**Status: NOT STARTED**

- Build manual annotations, notes, scenarios, and saved analysis first.
- Define and test detection rules before adding automated pattern labels.

## Phase 6 — Trading journal and risk management

**Status: NOT STARTED**

- Implement complete trade records, filters, attachments, and reports.
- Define calculation conventions and validate performance and risk calculations against known cases.

## Phase 7 — Backtesting

**Status: NOT STARTED**

- Define strategy and data models; include spread, commission, and slippage assumptions.
- Prevent look-ahead bias and leakage; provide reproducible reports and tests.
- Clearly separate backtesting, paper trading, and real trading.

## Phase 8 — Investment portfolio

**Status: NOT STARTED**

- Implement accounts, holdings, transactions, distributions, and realized/unrealized results.
- Label manually entered, estimated, delayed, and live valuations.

## Phase 9 — AI intelligence

**Status: NOT STARTED**

- Select a provider and keep credentials server-side.
- Ground outputs in identified sources, state uncertainty, add usage limits, and test missing/incorrect data handling.

## Phase 10 — Broker, Telegram, and automation

**Status: NOT STARTED**

- Verify official capabilities and permissions before implementation.
- Begin with authorized read-only synchronization and demo workflows.
- Keep live order execution disabled unless separately approved and protected by tested controls.

## Phase 11 — Education and community

**Status: NOT STARTED**

- Add educational content, profiles, community discussions, reporting, and moderation controls.
- Clearly distinguish community content from verified financial information.

## Phase 12 — Production readiness

**Status: NOT STARTED**

- Complete appropriate functional, security, accessibility, and performance reviews.
- Prepare deployment, backups, monitoring, operational documentation, and release checks.

## Status definitions

- **NOT STARTED:** work has not begun.
- **IN PROGRESS:** implementation work is underway.
- **IMPLEMENTED:** the planned code or documentation exists; this alone does not mean it has been tested.
- **TESTING:** checks are underway.
- **VERIFIED:** appropriate checks passed for the stated scope.
- **BLOCKED:** a concrete external dependency prevents progress.
