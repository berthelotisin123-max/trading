"""BETZO watchlist API routes."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.database import User, Watchlist
from app.schemas import WatchlistCreate, WatchlistItemIn, WatchlistItemOut, WatchlistOut
from app.services.auth import add_watchlist_item, create_watchlist, get_user_watchlists


router = APIRouter()


@router.post(
    "/watchlists",
    response_model=WatchlistOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_user_watchlist(
    watchlist_in: WatchlistCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    watchlist = await create_watchlist(db, current_user.id, watchlist_in)
    return watchlist


@router.get(
    "/watchlists",
    response_model=List[WatchlistOut],
    status_code=status.HTTP_200_OK,
)
async def list_user_watchlists(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    watchlists = await get_user_watchlists(db, current_user.id)
    return watchlists


@router.post(
    "/watchlists/{watchlist_id}/items",
    response_model=WatchlistItemOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_instrument_to_watchlist(
    watchlist_id: UUID,
    item_in: WatchlistItemIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify the watchlist belongs to the current user
    result = await db.execute(
        select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id)
    )
    watchlist = result.scalar_one_or_none()
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")

    item = await add_watchlist_item(db, watchlist_id, item_in)
    return item
