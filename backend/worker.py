import redis
from rq import Worker, Queue, Connection
from backend.core.config import settings
from backend.core.logger import setup_logging
import os

# Ensure logging is setup for the worker process
setup_logging()

# Prioritized queue listening
listen = ['high', 'default', 'low']
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
conn = redis.from_url(redis_url)

if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()
