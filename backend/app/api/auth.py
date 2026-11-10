"""BETZO authentication API routes."""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.db.session import get_db
from app.models.database import User, UserSession
from app.schemas import TokenResponse, UserLogin, UserOut, UserRegister, UserUpdate


router = APIRouter()


@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db), request: Request = None):
    from app.services.auth import get_user_by_email, create_user, create_user_session

    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = await create_user(db, user_in)
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))

    # Store refresh token session
    import hashlib
    refresh_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    await create_user_session(
        db, user, refresh_hash, expires_at,
        user_agent=request.headers.get("user-agent") if request else None,
        ip_address=request.client.host if request and request.client else None,
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/auth/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db), request: Request = None):
    from app.services.auth import authenticate_user, create_user_session

    user = await authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))

    import hashlib
    refresh_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    await create_user_session(
        db, user, refresh_hash, expires_at,
        user_agent=request.headers.get("user-agent") if request else None,
        ip_address=request.client.host if request and request.client else None,
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Revoke session(s) for the signed-in user.

    Send the stored `refresh_token` in the JSON body to revoke exactly that
    session. When no body is provided, every active session for the user is
    revoked (sign out everywhere) — the safe default.
    """
    from app.services.auth import get_active_session, revoke_session, revoke_user_sessions

    refresh_token = None
    try:
        body = await request.json()
        if isinstance(body, dict):
            refresh_token = body.get("refresh_token")
    except Exception:
        # No/invalid body: fall back to revoking all sessions.
        refresh_token = None

    if refresh_token:
        import hashlib
        refresh_hash = hashlib.sha256(str(refresh_token).encode()).hexdigest()
        session = await get_active_session(db, current_user.id, refresh_hash)
        if session:
            await revoke_session(db, session)
    else:
        await revoke_user_sessions(db, current_user.id)

    return None


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    from app.services.auth import get_active_session, revoke_session, create_user_session

    body = await request.json()
    refresh_token = body.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token required")

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id_str = payload.get("sub")
    try:
        user_id = UUID(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # Load the user explicitly: accessing `session.user` after a commit would
    # trigger a lazy load, which async SQLAlchemy cannot perform here.
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    import hashlib
    refresh_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    session = await get_active_session(db, user_id, refresh_hash)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session not found or revoked")

    access_token = create_access_token(subject=str(user_id))
    new_refresh_token = create_refresh_token(subject=str(user_id))

    # Rotate refresh token: revoke old, create new
    await revoke_session(db, session)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    await create_user_session(
        db,
        user,
        hashlib.sha256(new_refresh_token.encode()).hexdigest(),
        expires_at,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.get("/users/me", response_model=UserOut)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.patch("/users/me", response_model=UserOut)
async def update_current_user_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the signed-in user's profile (currently: display name)."""
    if user_in.name is not None:
        current_user.name = user_in.name
        await db.commit()
        await db.refresh(current_user)
    return current_user
