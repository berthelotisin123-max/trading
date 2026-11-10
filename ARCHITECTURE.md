# Proposed Architecture

**Status: planning only.** The current application is a static HTML/CSS/JavaScript prototype. None of the target services below exist yet.

## System boundaries

```text
Browser (React + TypeScript)
        | HTTPS REST; WebSockets only when needed
        v
FastAPI application
  | domain services       | provider adapters
  v                       v
PostgreSQL          Licensed market/news/calendar APIs
```

The browser should never receive provider secrets. The API is responsible for authentication, authorization, validation, user-data boundaries, and normalizing provider responses. Provider failures should produce explicit unavailable/stale status rather than fabricated values.

## Frontend proposal

- React + TypeScript + Vite.
- Feature-oriented areas: overview, markets, screener, calendar, news, analysis, journal, backtesting, risk, AI, integrations, portfolio, education/community, and settings.
- Shared design system, navigation, forms, tables, notifications, and API client.
- Charting library selected after feature, license, accessibility, and commercial-use review. Recharts may serve analytics; it is not presumed to be a full market chart engine.

## Backend proposal

FastAPI modules should align with domain boundaries: identity/access, instruments/market data, calendar/news, watchlists, analysis, journal/performance, risk, backtests, portfolio, AI, integrations, and audit. Keep HTTP routing thin; put validation and business rules into separately testable schemas/services.

Use REST for ordinary resource operations. Add WebSockets only for a justified real-time feature and an authorized data source. Background processing and Redis are deferred until refresh, notifications, or workload requirements justify them.

## Data and trust boundaries

- Normalize provider payloads into internal models while retaining source, observation time, retrieval time, and status where available.
- Distinguish provider-reported facts, user-entered values, derived calculations, and illustrative demo content.
- Store provider credentials in server-side secret configuration, never source control or browser bundles.
- Isolate user-owned records by authenticated user and enforce access in backend queries/services.
- Treat broker and messaging integrations as untrusted external boundaries; validate payloads and log relevant outcomes without exposing credentials.

## Deployment direction

Use environment-specific configuration and managed secrets. Add containers, migrations in deployment, health checks, monitoring, and backups when the backend is established. Document recovery and operational ownership before production. No production provider, cloud, or deployment platform has been selected.

## Architecture decisions still open

- Authentication/session approach and email/2FA services.
- Hosting and secrets-management platform.
- Charting library and commercial license.
- Market, calendar, and news providers and their permitted display/use.
- Background task and caching requirements.
- User-data retention, export, and deletion policy.
