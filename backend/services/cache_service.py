import json
from typing import Optional, Any
from backend.core.queue import get_redis
from backend.core.logger import logger

class CacheService:
    @staticmethod
    def get(key: str) -> Optional[Any]:
        """
        Retrieve intelligence from cache.
        """
        try:
            redis = get_redis()
            data = redis.get(f"cache:{key}")
            if data:
                return json.loads(data)
        except Exception as e:
            logger.error(f"Cache Read Error: {e}")
        return None

    @staticmethod
    def set(key: str, value: Any, ttl: int = 3600):
        """
        Persist intelligence into cache with TTL.
        """
        try:
            redis = get_redis()
            redis.setex(
                f"cache:{key}",
                ttl,
                json.dumps(value)
            )
        except Exception as e:
            logger.error(f"Cache Write Error: {e}")
