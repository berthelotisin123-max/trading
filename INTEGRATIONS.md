# Integration Evaluation and Plan

**Status: no provider or broker is currently connected or selected.** The prototype uses illustrative content only. This document defines how candidate integrations should be evaluated; it is not a provider recommendation or verification of current vendor terms.

## Provider evaluation checklist

For forex, equities/ETFs, bonds, commodities, crypto, historical prices, economic calendars, and financial news, compare candidates on:

1. Official documentation, API stability, and support channels.
2. Asset and geographic coverage, symbol mapping, and instrument specifications.
3. Data delay, timestamps, uptime history, and correction behavior.
4. Price, free-tier limits, rate limits, and expected production cost.
5. Display, caching, storage, derived-data, and redistribution rights, especially for commercial products.
6. Authentication and key rotation, data residency, privacy terms, and vendor security practices.
7. Sandbox/demo access, pagination, webhooks/streaming, and outage behavior.
8. Whether the product's intended use requires exchange/vendor agreements beyond an API subscription.

Record evidence, date checked, decision, and unresolved contract questions before integration. Do not treat a free developer key as permission for commercial display.

## Adapter approach

Define internal provider interfaces for instrument metadata, quotes/bars, calendar events, and news. Keep vendor-specific requests and response parsing inside adapters. Normalize data while retaining provider identity, source timestamp, retrieval timestamp, and any delay/status indicator. Make provider unavailability visible to users.

## Broker and trading platforms

- Investigate only official documented APIs, supported bridges, and broker permissions for MT4, MT5, Weltrade, or other brokers.
- Begin with read-only account data or statement import where officially supported.
- Never claim an account is connected until an authorized handshake succeeds and its status is recorded.
- Do not store broker passwords as ordinary plaintext.
- Keep live order execution out of the initial implementation. It requires separate product approval, regulatory review, demo validation, user confirmation, risk limits, duplicate/stale-signal handling, audit logs, and a kill switch.

## Telegram and AI

- Telegram import must use authorized interfaces, validate parsed fields, preserve message provenance, and never execute a parsed signal by itself.
- Proposed AI approach: use the OpenAI Responses API with structured outputs for a source-aware educational plan review, validate returned fields server-side, and handle refusals/incomplete output explicitly. The model must not select or submit orders.
- AI provider credentials stay server-side. Outputs should identify sources, distinguish facts from assumptions, state uncertainty, and not fabricate unavailable market or event data.
- The AI provider is not configured and there is no authenticated backend, so no AI analysis is currently active.

## Current state

No market-data, calendar, news, AI, broker, Telegram, MT4/MT5, or Weltrade integration is implemented.

The prototype's Markets page now contains a manually curated reference catalogue from public TradingView market categories, Forex Factory's Market guide, and Weltrade's published instrument overview. This is static informational metadata only; it is not an API integration, exhaustive provider inventory, live quote feed, or confirmation that a broker offers each symbol in a user's region/account.

The catalogue includes the SyntX families listed in Weltrade's public guide: FX Vol., SFX Vol., PainX/GainX variants (400, 600, 800, 999, 1200), FlipX, SwitchX, BreakX, TrendX, PlusX 1, FiboX, QuadX, and MAX PainX/MAX GainX. Variant availability and specifications must still be checked against the user's actual account and current instrument specification.

The News & Calendar page links to Forex Factory and groups the visible content types (breaking, fundamental, technical, industry/education). It does not ingest or reproduce their news articles. An authorized provider and content-use terms are required before adding an in-app feed.
