from fastapi import APIRouter, Depends
from typing import Any, Dict
from backend.api import schemas, deps
from backend.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=schemas.ResponseEnvelope[dict])
def get_dashboard(
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Returns the consolidated Business Intelligence metrics.
    """
    data = AnalyticsService.get_dashboard_metrics()
    return schemas.ResponseEnvelope(data=data)

@router.get("/executive", response_model=schemas.ResponseEnvelope[dict])
def get_executive_dash(
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Returns high-level Sovereign KPIs for law firm partners.
    """
    data = AnalyticsService.get_executive_metrics()
    return schemas.ResponseEnvelope(data=data)
