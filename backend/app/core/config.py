"""BETZO application configuration using pydantic-settings."""

from functools import lru_cache
from typing import List, Optional

from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    app_name: str = "BETZO Financial Intelligence"
    app_version: str = "0.1.0"
    debug: bool = False
    secret_key: str = Field(..., min_length=32)
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Database
    database_url: str = Field(..., description="Async PostgreSQL URL (sqlalchemy+asyncpg)")
    database_url_sync: Optional[str] = Field(None, description="Sync PostgreSQL URL for Alembic")

    # CORS
    cors_origins: List[str] = Field(default=["http://localhost:5173", "http://localhost:3000"])

    # Security
    bcrypt_rounds: int = 12

    # Provider/API keys (kept server-side only)
    market_data_api_key: Optional[str] = None
    news_api_key: Optional[str] = None
    calendar_api_key: Optional[str] = None

    @validator("secret_key")
    def _check_secret_key(cls, v):
        if v == "change-this-secret-key-in-production":
            raise ValueError("SECRET_KEY must be changed from the default for production")
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
