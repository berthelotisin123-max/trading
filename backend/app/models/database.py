"""BETZO database models based on DATABASE_SCHEMA.md."""

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    sessions: Mapped[List["UserSession"]] = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan"
    )
    preferences: Mapped[Optional["UserPreferences"]] = relationship(
        "UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    watchlists: Mapped[List["Watchlist"]] = relationship(
        "Watchlist", back_populates="user", cascade="all, delete-orphan"
    )
    trades: Mapped[List["Trade"]] = relationship(
        "Trade", back_populates="user", cascade="all, delete-orphan"
    )
    analyses: Mapped[List["AnalysisScenario"]] = relationship(
        "AnalysisScenario", back_populates="user", cascade="all, delete-orphan"
    )
    portfolios: Mapped[List["Portfolio"]] = relationship(
        "Portfolio", back_populates="user", cascade="all, delete-orphan"
    )


class UserSession(Base):
    __tablename__ = "user_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    refresh_token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    theme: Mapped[str] = mapped_column(String(20), default="dark", nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    risk_per_trade_pct: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    daily_loss_limit_pct: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="preferences")


class Instrument(Base):
    __tablename__ = "instruments"

    symbol: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    asset_class: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    is_tradable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    watchlist_items: Mapped[List["WatchlistItem"]] = relationship(
        "WatchlistItem", back_populates="instrument", cascade="all, delete-orphan"
    )
    trades: Mapped[List["Trade"]] = relationship("Trade", back_populates="instrument")


class Watchlist(Base):
    __tablename__ = "watchlists"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="watchlists")
    items: Mapped[List["WatchlistItem"]] = relationship(
        "WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_watchlist_user_name"),
    )


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    watchlist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("watchlists.id", ondelete="CASCADE"), nullable=False
    )
    instrument_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False
    )
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    watchlist: Mapped["Watchlist"] = relationship("Watchlist", back_populates="items")
    instrument: Mapped["Instrument"] = relationship("Instrument", back_populates="watchlist_items")

    __table_args__ = (
        UniqueConstraint("watchlist_id", "instrument_id", name="uq_watchlist_item"),
    )


class Trade(Base):
    __tablename__ = "trades"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    instrument_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("instruments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)  # BUY or SELL
    asset_class: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    entry_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 8), nullable=True)
    stop_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 8), nullable=True)
    target_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 8), nullable=True)
    result_r: Mapped[Optional[float]] = mapped_column(Numeric(10, 4), nullable=True)
    setup: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    trade_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    user: Mapped["User"] = relationship("User", back_populates="trades")
    instrument: Mapped[Optional["Instrument"]] = relationship("Instrument", back_populates="trades")
    attachments: Mapped[List["TradeAttachment"]] = relationship(
        "TradeAttachment", back_populates="trade", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("direction IN ('BUY', 'SELL')", name="ck_trade_direction"),
    )


class TradeAttachment(Base):
    __tablename__ = "trade_attachments"

    trade_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trades.id", ondelete="CASCADE"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(64), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(255), nullable=False)

    trade: Mapped["Trade"] = relationship("Trade", back_populates="attachments")


class AnalysisScenario(Base):
    __tablename__ = "analysis_scenarios"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    instrument: Mapped[str] = mapped_column(String(32), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(16), nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)
    risk_pct: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    entry_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 8), nullable=True)
    stop_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 8), nullable=True)
    target_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 8), nullable=True)
    confluence_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="manual-review", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="analyses")


class Portfolio(Base):
    __tablename__ = "portfolios"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    account_currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="portfolios")
    holdings: Mapped[List["Holding"]] = relationship(
        "Holding", back_populates="portfolio", cascade="all, delete-orphan"
    )


class Holding(Base):
    __tablename__ = "holdings"

    portfolio_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False
    )
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    asset_class: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    quantity: Mapped[float] = mapped_column(Numeric(18, 8), nullable=False)
    average_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 8), nullable=True)
    source: Mapped[str] = mapped_column(String(64), default="manual", nullable=False)

    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="holdings")
