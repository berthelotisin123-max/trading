"""BETZO Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, validator


# --- Auth ---

class UserRegister(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str = Field(..., min_length=8)

    @validator("password")
    def _validate_password(cls, v):
        import re
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a number")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain a special character")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: UUID
    email: str
    name: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Fields a signed-in user may change on their own profile."""

    name: Optional[str] = Field(None, max_length=255)

    @validator("name")
    def _validate_name(cls, v):
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty")
        return cleaned


# --- Instruments ---

class InstrumentOut(BaseModel):
    id: UUID
    symbol: str
    name: Optional[str]
    asset_class: str
    category: Optional[str]
    description: Optional[str]
    source: Optional[str]
    is_tradable: bool

    class Config:
        from_attributes = True


# --- Watchlist ---

class WatchlistItemIn(BaseModel):
    instrument_id: UUID


class WatchlistItemOut(BaseModel):
    id: UUID
    instrument_id: UUID
    instrument: InstrumentOut
    added_at: datetime

    class Config:
        from_attributes = True


class WatchlistOut(BaseModel):
    id: UUID
    name: str
    is_default: bool
    items: List[WatchlistItemOut] = []

    class Config:
        from_attributes = True


class WatchlistCreate(BaseModel):
    name: str


# --- Trade / Journal ---

class TradeIn(BaseModel):
    symbol: str
    direction: str
    asset_class: Optional[str] = None
    entry_price: Optional[float] = None
    stop_price: Optional[float] = None
    target_price: Optional[float] = None
    result_r: Optional[float] = None
    setup: Optional[str] = None
    notes: Optional[str] = None
    trade_date: datetime

    @validator("direction")
    def _validate_direction(cls, v):
        if v.upper() not in ("BUY", "SELL"):
            raise ValueError("Direction must be BUY or SELL")
        return v.upper()


class TradeOut(BaseModel):
    id: UUID
    symbol: str
    direction: str
    asset_class: Optional[str]
    entry_price: Optional[float]
    stop_price: Optional[float]
    target_price: Optional[float]
    result_r: Optional[float]
    setup: Optional[str]
    notes: Optional[str]
    trade_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# --- Analysis ---

class AnalysisIn(BaseModel):
    instrument: str
    timeframe: str
    direction: str
    risk_pct: float = Field(..., ge=0, le=100)
    entry_price: Optional[float] = None
    stop_price: Optional[float] = None
    target_price: Optional[float] = None
    confluence_score: Optional[int] = None
    notes: Optional[str] = None


class AnalysisOut(BaseModel):
    id: UUID
    instrument: str
    timeframe: str
    direction: str
    risk_pct: float
    entry_price: Optional[float]
    stop_price: Optional[float]
    target_price: Optional[float]
    confluence_score: Optional[int]
    notes: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Portfolio / Holdings ---

class HoldingIn(BaseModel):
    symbol: str
    asset_class: Optional[str] = None
    quantity: float
    average_price: Optional[float] = None
    source: str = "manual"


class HoldingOut(BaseModel):
    id: UUID
    symbol: str
    asset_class: Optional[str]
    quantity: float
    average_price: Optional[float]
    source: str

    class Config:
        from_attributes = True


class PortfolioOut(BaseModel):
    id: UUID
    name: str
    account_currency: str
    holdings: List[HoldingOut] = []

    class Config:
        from_attributes = True


# --- Error ---

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None
