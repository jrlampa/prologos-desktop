import time
from typing import Optional, Dict, Any
from backend.core.logger import logger
from backend.core.queue import get_redis
from backend.services.event_service import EventService

class SelfHealingService:
    """
    Industrial Self-Healing Orchestrator.
    Detects systemic degradation and triggers autonomous remediation actions.
    """
    
    @staticmethod
    def notify_failure(service_name: str, error_detail: str):
        """Record a failure event and evaluate remediation."""
        try:
            redis = get_redis()
            failure_key = f"self_healing:failures:{service_name}"
            # Increment failure counter with a short window (e.g., 5 minutes)
            count = redis.incr(failure_key)
            if count == 1:
                redis.expire(failure_key, 300)
                
            logger.warning(f"SELF_HEALING: Detected failure in {service_name}. Window Count: {count}")
            
            if count >= 10: # Threshold for autonomous action
                SelfHealingService.trigger_remediation(service_name)
        except Exception as e:
            logger.error(f"Self-Healing Notification Failure: {e}")

    @staticmethod
    def trigger_remediation(service_name: str):
        """Execute proactive recovery strategies."""
        logger.critical(f"SELF_HEALING: Triggering AUTONOMOUS REMEDIATION for {service_name}")
        
        # 1. Emit Industrial Event
        # In a real environment, this might trigger a K8s restart or a DNS failover
        try:
            from backend.core.database import SessionLocal
            db = SessionLocal()
            EventService.emit_event(db, "system.self_healing_triggered", {
                "service": service_name,
                "action": "RESET_CONNECTION_POOL",
                "timestamp": time.time()
            })
            db.close()
        except Exception:
            pass

        # 2. Specific Remediation Logic
        if "AI_SERVICE" in service_name:
            # Action: Purge potentially corrupted semantic cache or reset breaker
            redis = get_redis()
            redis.delete(f"cb:{service_name}") # Force reset circuit breaker state
            logger.info(f"SELF_HEALING: Reset Circuit Breaker for {service_name}")
            
        elif "DATABASE" in service_name:
            logger.warning("SELF_HEALING: System-wide connection pool reset signaled.")

    @staticmethod
    def check_system_integrity() -> Dict[str, Any]:
        """Proactive integrity check for background monitor."""
        from backend.services.health_service import HealthService
        from backend.core.database import SessionLocal
        
        db = SessionLocal()
        status = HealthService.get_full_status(db)
        db.close()
        
        remediation_active = False
        if status["status"] == "degraded":
            remediation_active = True
            SelfHealingService.notify_failure("SYSTEM_OVERALL", "General system degradation detected.")
            
        return {
            "integrity_status": "COMPROMISED" if remediation_active else "INTACT",
            "active_remediations": 1 if remediation_active else 0,
            "timestamp": time.time()
        }
