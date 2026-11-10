"""BETZO API route registry."""

from fastapi import APIRouter

from app.api import auth, instruments, journal, watchlist, analysis

auth_router = auth.router
instruments_router = instruments.router
journal_router = journal.router
watchlist_router = watchlist.router
analysis_router = analysis.router

# Export for main.py
router = APIRouter()
