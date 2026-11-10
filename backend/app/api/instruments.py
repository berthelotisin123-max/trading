"""BETZO instruments API routes."""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.database import Instrument
from app.schemas import InstrumentOut
from app.services.auth import get_instrument_by_id, get_instruments


router = APIRouter()


@router.get(
    "/instruments",
    response_model=List[InstrumentOut],
    status_code=status.HTTP_200_OK,
)
async def list_instruments(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    asset_class: Optional[str] = Query(None),
):
    instruments = await get_instruments(db, skip=skip, limit=limit, asset_class=asset_class)
    return instruments


@router.get(
    "/instruments/{instrument_id}",
    response_model=InstrumentOut,
    status_code=status.HTTP_200_OK,
)
async def get_instrument(
    instrument_id: str,
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID

    try:
        instrument_id_uuid = UUID(instrument_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid instrument ID format",
        )

    instrument = await get_instrument_by_id(db, instrument_id_uuid)
    if not instrument:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instrument not found",
        )
    return instrument


@router.get(
    "/markets/{asset_class}",
    response_model=List[InstrumentOut],
    status_code=status.HTTP_200_OK,
)
async def list_markets_by_class(
    asset_class: str,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    instruments = await get_instruments(
        db, skip=skip, limit=limit, asset_class=asset_class
    )
    return instruments
