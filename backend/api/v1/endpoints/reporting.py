from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.api import schemas, deps
from backend.services.reporting_service import ReportingService

router = APIRouter()

@router.get("/institutional", response_model=schemas.ResponseEnvelope[schemas.InstitutionalReport])
async def get_institutional_report(
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("view_reports"))
) -> Any:
    """
    Generate high-level institutional Business Intelligence report.
    Consolidates traffic analytics, data quality, and resilience KPIs.
    """
    report = ReportingService.generate_report(db)
    return schemas.ResponseEnvelope(data=report)

@router.get("/kpis", response_model=schemas.ResponseEnvelope[schemas.KPIMetrics])
def get_kpi_summary(
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Fast-track KPI summary for dashboard widgets.
    """
    kpis = ReportingService.generate_institutional_kpis(db)
    return schemas.ResponseEnvelope(data=kpis)
