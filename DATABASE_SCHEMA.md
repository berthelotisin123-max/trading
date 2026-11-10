# Proposed Database Schema

**Status: conceptual plan.** There is no database or migration system in the current project. Tables and fields below need refinement before migrations are written.

## Design principles

- PostgreSQL with UUID primary keys, UTC timestamps, explicit numeric precision for financial quantities, foreign keys, and migrations.
- Put `user_id` on user-owned records and index common ownership/time queries. Enforce authorization in the service layer and consider database row-level security only after deployment and role behavior are designed.
- Store money/price/quantity values as fixed-precision decimals, not binary floating point. Document currency and units.
- Preserve source and status metadata for external data. Never imply a quote is live without provider evidence.

## Initial entity groups

| Domain | Candidate entities | Key relationships / notes |
|---|---|---|
| Identity | `users`, `user_preferences`, `sessions` or refresh-token records, `roles`, `user_roles` | Unique normalized email; password hash only; session revocation and verification state. Choose auth design before migration. |
| Instruments | `instruments`, `instrument_aliases` | Stable internal ID; symbol, name, asset class, quote/base currency, venue/provider mapping, trading terms where sourced. |
| Market data | `price_bars`, optional `quotes` | Instrument and interval/time indexes; source, observed/retrieved times, status. Retention and licensed storage rules vary by provider. |
| User workspace | `watchlists`, `watchlist_items`, `price_alerts`, `saved_screens` | Owner-scoped; unique ordering/item constraints; alert execution depends on future data service. |
| Calendar/news | `economic_events`, `news_items` or provider references | Source IDs, attribution, publication/event times, status. Store full article text only if license permits. |
| Analysis | `analysis_scenarios`, `analysis_annotations`, `analysis_attachments` | Owner, instrument, timeframe, notes, structured manual levels; attachment storage policy TBD. |
| Journal | `trades`, `trade_attachments`, `strategies` | Instrument, side, timestamps, prices, size, fees, currency, realized result, risk fields, notes. Define partial close and imported-trade handling. |
| Backtesting | `backtest_definitions`, `backtest_runs`, `backtest_trades` | Version strategy/config and data source/period/cost assumptions for reproducibility. Large result retention policy TBD. |
| Risk | `risk_limits`, optional `risk_snapshots` | Account currency, scope, effective time, explicit calculation assumptions. |
| Portfolio | `portfolios`, `holdings` or derived positions, `transactions`, `distributions` | Distinguish instrument ownership records from broker/CFD exposure; include currency and valuation source. |
| Integrations | `integration_connections`, `sync_runs`, `integration_events` | Store encrypted tokens/secrets via a proper secret mechanism or references, never ordinary plaintext credentials. |
| Operations | `audit_events`, `notification_preferences`, `notifications` | Avoid sensitive payloads in logs; define retention and administrative access. |

## Important modeling decisions

- **Trade accounting:** choose whether results are calculated from fills or entered manually; model fees, currency conversion, partial exits, and imported data without double counting.
- **Market data:** confirm provider retention and redistribution terms before storing bars or quotes. Some providers limit caching or display.
- **Portfolio:** distinguish holdings of underlying securities from derivative/CFD exposure and label source of every valuation.
- **Attachments:** define size limits, access checks, retention, malware scanning, and storage location before upload support.
- **Deletion/export:** design user export and deletion semantics, including backups, audit records, attachments, and integration credentials.

## Indexing and integrity candidates

Index owner/time queries (for example `user_id, created_at`), instrument/time market-series queries, event time/country/impact, and unique provider/source identifiers. Use database constraints for required fields and natural uniqueness where appropriate. Final indexes depend on measured query patterns.
