import redis
from backend.core.config import settings

def get_redis():
    """
    Enterprise-ready Redis connection provider.
    """
    return redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_queue():
    """
    Standard background queue access.
    """
    from rq import Queue
    return Queue(connection=get_redis())
