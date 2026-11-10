"""BETZO analysis API routes."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.database import AnalysisScenario, User
from app.schemas import AnalysisIn, AnalysisOut
from app.services.auth import create_analysis


router = APIRouter()


@router.post(
    "/analysis/scenarios",
    response_model=AnalysisOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_analysis_scenario(
    analysis_in: AnalysisIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    analysis = await create_analysis(db, current_user.id, analysis_in)
    return analysis


@router.get(
    "/analysis/scenarios",
    response_model=List[AnalysisOut],
    status_code=status.HTTP_200_OK,
)
async def list_analysis_scenarios(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select

    result = await db.execute(
        select(AnalysisScenario)
        .where(AnalysisScenario.user_id == current_user.id)
        .order_by(AnalysisScenario.created_at.desc())
    )
    return result.scalars().all()
