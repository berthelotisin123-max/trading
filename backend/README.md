# BETZO Backend - Phase 2: Authentication & Backend Foundation

## Prerequisites

1. **Install Python** (3.10+)
   - Download from https://www.python.org/
   - Or use the Microsoft Store

2. **Install PostgreSQL**
   - Download from https://www.postgresql.org/
   - Create a database: `createdb betzo`
   - Create a user: `betzo` with password `betzo_password` (or update `.env`)
   - Enable pgcrypto extension (required for `gen_random_uuid()`):
     ```sql
     CREATE EXTENSION IF NOT EXISTS pgcrypto;
     ```

## Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
copy .env.example .env
# Edit .env with your database credentials and secret key

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Sign in
- `POST /api/v1/auth/logout` - Sign out
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/users/me` - Get current user profile

### Instruments
- `GET /api/v1/instruments` - List instruments
- `GET /api/v1/instruments/{id}` - Get instrument by ID
- `GET /api/v1/markets/{asset_class}` - List instruments by asset class

### Journal (placeholder - auth dependency pending)
- `POST /api/v1/journal/trades` - Record a trade
- `GET /api/v1/journal/trades` - List trades

### Watchlist (placeholder - auth dependency pending)
- `POST /api/v1/watchlists` - Create watchlist
- `GET /api/v1/watchlists` - List watchlists
- `POST /api/v1/watchlists/{id}/items` - Add instrument to watchlist

### Analysis (placeholder - auth dependency pending)
- `POST /api/v1/analysis/scenarios` - Create analysis
- `GET /api/v1/analysis/scenarios` - List analyses

## Project Structure

```
backend/
├── app/
│   ├── api/          # API route modules
│   ├── core/         # Config, security
│   ├── db/           # Database session, base models
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
├── migrations/       # Alembic migrations
├── tests/            # Test suite
├── alembic.ini       # Alembic config
└── requirements.txt  # Python dependencies
```

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT access tokens expire in 30 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are stored as SHA-256 hashes in the database
- All provider credentials must be stored server-side only (never in frontend)
