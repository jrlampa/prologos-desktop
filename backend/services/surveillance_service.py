import time
import json
from typing import Dict, Any, Optional
from backend.core.queue import get_redis
from backend.core.logger import logger
from backend.services.config_service import ConfigService

class SurveillanceService:
    RISK_THRESHOLD = 100 # Internal units for auto-lockdown
    
    @staticmethod
    def record_activity(api_key_id: str, is_error: bool = False):
        """
        Record a request event for predictive surveillance.
        Increments activity and risk score if needed.
        """
        try:
            redis = get_redis()
            pipe = redis.pipeline()
            
            # 1. Sliding Window Activity (1 minute)
            now = int(time.time())
            window_key = f"surveillance:activity:{api_key_id}:{now // 60}"
            pipe.incr(window_key)
            pipe.expire(window_key, 120)
            
            # 2. Risk Score Accumulation
            risk_key = f"surveillance:risk:{api_key_id}"
            if is_error:
                pipe.incrby(risk_key, 10) # Heavy penalty for errors (potential brute force)
            else:
                pipe.incr(risk_key) # Light score for valid traffic
                
            pipe.expire(risk_key, 3600) # Risk cools down over 1 hour
            
            pipe.execute()
        except Exception as e:
            logger.error(f"Surveillance Error [Record]: {e}")

    @staticmethod
    def get_risk_score(api_key_id: str) -> int:
        """Retrieve the current risk score for an identity."""
        try:
            redis = get_redis()
            val = redis.get(f"surveillance:risk:{api_key_id}")
            return int(val) if val else 0
        except Exception:
            return 0

    @staticmethod
    def evaluate_threat(api_key_id: str) -> Dict[str, Any]:
        """
        Predictive Logic: Is this identity behaving as a threat?
        Returns risk assessment.
        """
        score = SurveillanceService.get_risk_score(api_key_id)
        
        is_threat = score > SurveillanceService.RISK_THRESHOLD
        
        if is_threat:
            logger.warning(f"THRESHOLD_BREACH: Identity {api_key_id} flagged as threat (Score: {score})")
            
        return {
            "score": score,
            "is_threat": is_threat,
            "threshold": SurveillanceService.RISK_THRESHOLD,
            "recommendation": "BLOCK" if is_threat else "ALLOW"
        }

    @staticmethod
    def reset_risk(api_key_id: str):
        """Governance override: Reset risk score."""
        try:
            redis = get_redis()
            redis.delete(f"surveillance:risk:{api_key_id}")
        except Exception:
            pass
