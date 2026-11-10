"""BETZO Backend.

This directory contains the Python/FastAPI backend for BETZO Financial
Intelligence, implementing Phase 2 of the project roadmap: Authentication
and backend foundation.

Quick Start
-----------

1. Install Python 3.10+
2. Install PostgreSQL and create a ``betzo`` database
3. Copy ``.env.example`` to ``.env`` and configure your settings
4. Install dependencies: ``pip install -r requirements.txt``
5. Run migrations: ``alembic upgrade head``
6. Start server: ``uvicorn app.main:app --reload``

See ``README.md`` for full documentation.

Architecture
------------

- FastAPI web framework
- SQLAlchemy 2.0 (async) with PostgreSQL
- Alembic for database migrations
- JWT authentication with bcrypt password hashing
- Pydantic for request/response validation
"""
