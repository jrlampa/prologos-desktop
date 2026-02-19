from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from backend.api import schemas
from backend.api.deps import get_db, check_permission
from backend.services.observability_service import ObservabilityService
from backend.services.health_service import HealthService
from backend.core.queue import get_redis
import json

router = APIRouter()

@router.get("/metrics", response_model=schemas.ResponseEnvelope[dict])
def get_executive_metrics(
    request: Request,
    db: Session = Depends(get_db),
    _ = Depends(check_permission("auditor")) # Only auditors/admins can see industrial metrics
):
    """
    Industrial Executive Dashboard: Real-time SLOs and health metrics.
    """
    # 1. System Health
    health = HealthService.get_full_status(db)
    
    # 2. SLO Compliance
    slo = ObservabilityService.get_slo_status()
    
    # 3. Recent Span Samples (Observability)
    redis = get_redis()
    recent_spans_raw = redis.lrange("telemetry:spans:recent", 0, 9)
    recent_spans = [eval(span.decode()) for span in recent_spans_raw]
    
    # 4. Semantic Intelligence (Phase 19)
    from backend.services.analytics_service import AnalyticsService
    org_id = getattr(request.state, "org_id", None)
    semantic_stats = AnalyticsService.get_semantic_cache_stats(org_id=org_id)
    
    return schemas.ResponseEnvelope(data={
        "health_status": health["status"],
        "slo_compliance": slo,
        "ai_intelligence": semantic_stats,
        "infrastructure": {
            "db": health["db"],
            "redis": health["redis"],
            "telemetry": health["telemetry"]
        },
        "recent_activity": recent_spans
    })

@router.get("/events", response_model=schemas.ResponseEnvelope[dict])
def get_institutional_events(
    request: Request,
    _ = Depends(check_permission("auditor"))
):
    """Retrieve cumulative institutional telemetry events."""
    redis = get_redis()
    org_id = getattr(request.state, "org_id", None)
    scope = f"org:{org_id}:" if org_id else "global:"
    
    # Mocking some common events for visualization
    event_keys = redis.keys(f"telemetry:events:{scope}*")
    events = {key.decode().split(":")[-1]: int(redis.get(key)) for key in event_keys}
    
    return schemas.ResponseEnvelope(data=events)
