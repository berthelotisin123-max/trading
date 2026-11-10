# API Plan

**Status: proposed, not implemented.** There is no backend or API in the current project. Routes below are planning examples, not working endpoints.

## Conventions

- Version the API under `/api/v1`.
- JSON requests/responses, schema validation, consistent error bodies, and UTC timestamps in ISO 8601 form.
- Authenticate and authorize on the server; scope user records to the authenticated principal.
- Paginate collection endpoints and define stable sorting/filter semantics.
- Do not return provider credentials or sensitive integration data.
- Return source/freshness/status metadata for external data; distinguish missing, stale, delayed, demo, and live states.

## Candidate resource groups

| Area | Candidate routes | Notes |
|---|---|---|
| Identity | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/recovery`, `/users/me`, `/users/me/preferences` | Final approach depends on session and identity-provider decision. |
| Instruments | `/instruments`, `/instruments/{id}`, `/markets/{asset_class}` | Metadata may be available without a quote; do not invent prices. |
| Market data | `/instruments/{id}/bars`, `/instruments/{id}/quote` | Include source and timestamps; only enable after provider approval and licensing review. |
| Watchlists | `/watchlists`, `/watchlists/{id}/items` | User-owned CRUD with authorization. |
| Calendar/news | `/calendar/events`, `/news` | Filters, pagination, timezone-safe event times, attribution, and freshness. |
| Analysis | `/analysis/scenarios` | Manual notes and annotations; no automatic signal implied. |
| Journal | `/journal/trades`, `/journal/trades/{id}`, `/journal/reports` | Validate numeric ranges and ownership; report formulas must be defined and tested. |
| Risk | `/risk/calculations/*` | Stateless calculations should return assumptions and units. |
| Backtesting | `/backtests`, `/backtests/{id}`, `/backtests/{id}/trades` | Runs should capture versioned strategy, data, and transaction-cost assumptions. |
| Portfolio | `/portfolios`, `/portfolios/{id}/transactions`, `/portfolios/{id}/holdings` | Label manual and provider valuations. |
| Integrations | `/integrations`, `/integrations/{id}/sync-runs` | Read-only first; secret exchange and token lifecycle require explicit design. |

## Error shape proposal

Use a stable error object with a machine-readable `code`, human-readable `message`, optional field-level `details`, and request/correlation ID. Never expose stack traces, SQL, or secrets in client-facing errors.

## Operational safeguards

Add rate limits to authentication and expensive endpoints, request size limits, timeouts for providers, and idempotency where retries can duplicate writes. Define pagination, retention, and cache rules in the relevant endpoint contract. Generate OpenAPI from FastAPI once implemented and keep this document aligned with the actual API.
