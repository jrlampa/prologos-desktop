from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.core.config import settings
from backend.core.queue import get_redis
from backend.services.telemetry_service import TelemetryService
from backend.services.observability_service import ObservabilityService
from backend.core.logger import logger

class HealthService:
    @staticmethod
    def get_full_status(db: Session) -> Dict[str, Any]:
        """Deep Enterprise health check with Telemetry."""
        db_status = "ok"
        try:
            db.execute(text("SELECT 1"))
        except Exception as e:
            logger.error(f"Health Check - DB Failure: {e}")
            db_status = "error"

        redis_status = "ok"
        try:
            redis_conn = get_redis()
            redis_conn.ping()
        except Exception as e:
            logger.error(f"Health Check - Redis Failure: {e}")
            redis_status = "error"

        # Hardware Intelligence
        telemetry = TelemetryService.get_system_metrics()
        
        # Industrial SLOs (Phase 18)
        slo_metrics = ObservabilityService.get_slo_status()

        return {
            "status": "healthy" if db_status == "ok" and redis_status == "ok" else "degraded",
            "db": db_status,
            "redis": redis_status,
            "telemetry": telemetry,
            "slo_compliance": slo_metrics,
            "version": settings.VERSION
        }
