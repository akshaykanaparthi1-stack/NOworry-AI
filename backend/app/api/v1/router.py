from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    dashboard,
    opportunities,
    agent,
    actions,
    analytics,
    roi,
    audit,
    demo
)

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(roi.router, prefix="/roi", tags=["roi"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
api_router.include_router(demo.router, prefix="/demo", tags=["demo"])
