from fastapi import APIRouter, Depends, Request
from typing import Any
from backend.api import schemas, deps
from backend.services.benchmarking_service import BenchmarkingService

router = APIRouter()

@router.get("/comparison", response_model=schemas.ResponseEnvelope[dict])
def get_benchmarking_comparison(
    request: Request,
    _ = Depends(deps.check_permission("auditor"))
):
    """
    Retrieve anonymized market benchmarking vs Current Tenant.
    Provides strategic insight for sector dominance.
    """
    org_id = getattr(request.state, "org_id", None)
    comparison = BenchmarkingService.get_market_comparison(org_id=org_id)
    return schemas.ResponseEnvelope(data=comparison)

@router.get("/radar", response_model=schemas.ResponseEnvelope[dict])
def get_global_market_radar():
    """
    Public Sector Radar: High-level trends and volatility.
    Demonstrates platform authority in the market.
    """
    radar = BenchmarkingService.get_market_radar()
    return schemas.ResponseEnvelope(data=radar)
