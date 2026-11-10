BETZO Financial Intelligence — Starter Prototype

WHAT THIS IS
A responsive, front-end-only prototype for a multi-asset trading and investment platform.
It includes Overview, Markets, Trading Journal, ICT/SMC Analysis, Backtesting, Automation, and Investments sections.

IMPORTANT LIMITATIONS
- All chart movement, market changes, sample trades, and metrics are illustrative.
- There are no live quotes, market-data feeds, authentication, server/database, AI provider, broker, Telegram, or MT5 connections.
- Journal entries and analysis notes are saved only in the current browser's localStorage.
- This is not financial advice and it does not execute trades.
- Before commercial use, add backend authentication, authorization, secure storage, testing, privacy controls, and appropriate market-data licenses.
- Broker execution, investment advice, and managing customer money may trigger legal or regulatory requirements.

HOW TO RUN
1. Extract the ZIP file.
2. Open index.html in a modern web browser.
3. For development, open the folder in VS Code and use a local development server if desired.

SUGGESTED NEXT BUILD STEPS
1. Move the interface into a React + TypeScript project.
2. Add a FastAPI backend and PostgreSQL database.
3. Add authentication and user-specific records.
4. Integrate one reliable market-data provider and clearly show data timestamps.
5. Implement real backtesting with historical data, costs, slippage, and out-of-sample validation.
6. Add broker/Telegram integrations only after testing safety controls in demo environments.
