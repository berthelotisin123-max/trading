"""BETZO database services: business logic separated from HTTP routes."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.db.base import Base
from app.models.database import (
    AnalysisScenario,
    Instrument,
    Trade,
    User,
    UserSession,
    Watchlist,
    WatchlistItem,
)
from app.schemas import (
    AnalysisIn,
    InstrumentOut,
    TradeIn,
    TradeOut,
    UserLogin,
    UserOut,
    UserRegister,
    WatchlistCreate,
    WatchlistItemIn,
)


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_in: UserRegister) -> User:
    user = User(
        email=user_in.email.lower(),
        name=user_in.name,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


async def create_user_session(
    db: AsyncSession,
    user: User,
    refresh_token_hash: str,
    expires_at,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> UserSession:
    session = UserSession(
        user_id=user.id,
        refresh_token_hash=refresh_token_hash,
        expires_at=expires_at,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_active_session(
    db: AsyncSession, user_id: UUID, refresh_token_hash: str
) -> Optional[UserSession]:
    result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == user_id,
            UserSession.refresh_token_hash == refresh_token_hash,
            UserSession.revoked_at.is_(None),
        )
    )
    return result.scalar_one_or_none()


async def revoke_session(db: AsyncSession, session: UserSession) -> None:
    from datetime import datetime, timezone
    session.revoked_at = datetime.now(timezone.utc)
    await db.commit()


# --- Instruments ---

async def get_instruments(
    db: AsyncSession, skip: int = 0, limit: int = 100, asset_class: Optional[str] = None
) -> List[Instrument]:
    query = select(Instrument)
    if asset_class:
        query = query.where(Instrument.asset_class == asset_class)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_instrument_by_id(db: AsyncSession, instrument_id: UUID) -> Optional[Instrument]:
    result = await db.execute(select(Instrument).where(Instrument.id == instrument_id))
    return result.scalar_one_or_none()


# --- Watchlists ---

async def get_user_watchlists(db: AsyncSession, user_id: UUID) -> List[Watchlist]:
    result = await db.execute(
        select(Watchlist)
        .options(
            selectinload(Watchlist.items).joinedload(WatchlistItem.instrument)
        )
        .where(Watchlist.user_id == user_id)
    )
    return result.scalars().all()


async def create_watchlist(db: AsyncSession, user_id: UUID, watchlist_in: WatchlistCreate) -> Watchlist:
    watchlist = Watchlist(user_id=user_id, name=watchlist_in.name)
    db.add(watchlist)
    await db.commit()
    await db.refresh(watchlist)
    return watchlist


async def add_watchlist_item(
    db: AsyncSession, watchlist_id: UUID, item_in: WatchlistItemIn
) -> WatchlistItem:
    item = WatchlistItem(watchlist_id=watchlist_id, instrument_id=item_in.instrument_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


# --- Trades ---

async def create_trade(db: AsyncSession, user_id: UUID, trade_in: TradeIn) -> Trade:
    trade = Trade(
        user_id=user_id,
        symbol=trade_in.symbol,
        direction=trade_in.direction,
        asset_class=trade_in.asset_class,
        entry_price=trade_in.entry_price,
        stop_price=trade_in.stop_price,
        target_price=trade_in.target_price,
        result_r=trade_in.result_r,
        setup=trade_in.setup,
        notes=trade_in.notes,
        trade_date=trade_in.trade_date,
    )
    db.add(trade)
    await db.commit()
    await db.refresh(trade)
    return trade


async def get_user_trades(
    db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
) -> List[Trade]:
    result = await db.execute(
        select(Trade)
        .where(Trade.user_id == user_id)
        .order_by(Trade.trade_date.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


# --- Analysis ---

async def create_analysis(
    db: AsyncSession, user_id: UUID, analysis_in: AnalysisIn
) -> AnalysisScenario:
    analysis = AnalysisScenario(
        user_id=user_id,
        instrument=analysis_in.instrument,
        timeframe=analysis_in.timeframe,
        direction=analysis_in.direction,
        risk_pct=analysis_in.risk_pct,
        entry_price=analysis_in.entry_price,
        stop_price=analysis_in.stop_price,
        target_price=analysis_in.target_price,
        confluence_score=analysis_in.confluence_score,
        notes=analysis_in.notes,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis
