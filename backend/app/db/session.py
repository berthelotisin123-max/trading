"""BETZO database session management."""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base

# Determine the sync URL for Alembic
database_url = settings.database_url
if not settings.database_url_sync:
    # Derive sync URL from async URL by replacing the driver
    database_url_sync = database_url.replace("+asyncpg", "")
else:
    database_url_sync = settings.database_url_sync

engine = create_async_engine(
    database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session and ensure it is closed after use."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
