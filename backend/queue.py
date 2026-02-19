import os

from redis import Redis
from rq import Queue

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
QUEUE_NAME = os.getenv("PROLOGOS_QUEUE_NAME", "prologos")


def get_redis() -> Redis:
    # decode_responses=False (default) para manter compatibilidade com RQ/Redis.
    return Redis.from_url(REDIS_URL)


def get_queue(name: str = QUEUE_NAME) -> Queue:
    return Queue(name=name, connection=get_redis())
