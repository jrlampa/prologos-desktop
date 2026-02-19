import json
from typing import Any, Optional
from backend.core.queue import get_redis
from backend.core.logger import logger

class ConfigService:
    @staticmethod
    def get(key: str, default: Any = None) -> Any:
        """
        Retrieve dynamic configuration from Redis.
        """
        try:
            redis = get_redis()
            val = redis.get(f"config:{key}")
            if val:
                return json.loads(val)
        except Exception as e:
            logger.error(f"ConfigService Error [GET {key}]: {e}")
            
        return default

    @staticmethod
    def set(key: str, value: Any):
        """
        Persist dynamic configuration in Redis.
        """
        try:
            redis = get_redis()
            redis.set(f"config:{key}", json.dumps(value))
            logger.info(f"Dynamic Config Updated: {key} = {value}")
        except Exception as e:
            logger.error(f"ConfigService Error [SET {key}]: {e}")

    @staticmethod
    def is_maintenance_mode() -> bool:
        """Check if institutional maintenance mode is active."""
        return ConfigService.get("maintenance_mode", False)

    @staticmethod
    def get_ai_timeout() -> int:
        """Get live AI service timeout."""
        return ConfigService.get("ai_timeout", 30)

    @staticmethod
    def get_audit_retention_days() -> int:
        """Institutional retention policy: audit logs lifetime in hot storage."""
        return ConfigService.get("audit_retention_days", 90)
