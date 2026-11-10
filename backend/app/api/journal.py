"""BETZO trading journal API routes."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.database import Trade, User
from app.schemas import TradeIn, TradeOut
from app.services.auth import create_trade, get_user_trades


router = APIRouter()


@router.post(
    "/journal/trades",
    response_model=TradeOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_trade_entry(
    trade_in: TradeIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trade = await create_trade(db, current_user.id, trade_in)
    return trade


@router.get(
    "/journal/trades",
    response_model=List[TradeOut],
    status_code=status.HTTP_200_OK,
)
async def list_trades(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    trades = await get_user_trades(db, current_user.id, skip=skip, limit=limit)
    return trades
