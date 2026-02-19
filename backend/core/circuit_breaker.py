import time
import json
from enum import Enum
from backend.core.logger import logger
from backend.core.queue import get_redis

class CircuitState(Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.name = f"cb:{name}"
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout

    def _get_state(self, redis) -> dict:
        data = redis.get(self.name)
        if data:
            return json.loads(data)
        return {"state": CircuitState.CLOSED.value, "failures": 0, "last_failure_time": 0}

    def _set_state(self, redis, state: dict):
        redis.set(self.name, json.dumps(state))

    def __call__(self, func):
        def wrapper(*args, **kwargs):
            redis = get_redis()
            state_data = self._get_state(redis)
            
            # 1. State Intelligence
            if state_data["state"] == CircuitState.OPEN.value:
                if time.time() - state_data["last_failure_time"] > self.recovery_timeout:
                    logger.info(f"Circuit Breaker [{self.name}] moving to HALF_OPEN (Distributed)")
                    state_data["state"] = CircuitState.HALF_OPEN.value
                    self._set_state(redis, state_data)
                else:
                    logger.warning(f"Circuit Breaker [{self.name}] is OPEN. Blocking call.")
                    raise Exception(f"Circuit breaker {self.name} is currently open")

            try:
                result = func(*args, **kwargs)
                
                # 2. Success Recovery
                if state_data["state"] == CircuitState.HALF_OPEN.value:
                    logger.info(f"Circuit Breaker [{self.name}] moving to CLOSED (Success Recovery)")
                    state_data["state"] = CircuitState.CLOSED.value
                    state_data["failures"] = 0
                    self._set_state(redis, state_data)
                
                return result
                
            except Exception as e:
                # 3. Failure Management + Autonomous Notification (Phase 20)
                from backend.services.self_healing_service import SelfHealingService
                SelfHealingService.notify_failure(self.name, str(e))
                
                state_data["failures"] += 1
                state_data["last_failure_time"] = time.time()
                
                if state_data["failures"] >= self.failure_threshold:
                    logger.critical(f"Circuit Breaker [{self.name}] TRI-STATE -> OPEN (Threshold Reached)")
                    state_data["state"] = CircuitState.OPEN.value
                
                self._set_state(redis, state_data)
                raise e
                
        return wrapper

# Circuit Breakers for individual external services
ai_circuit_breaker = CircuitBreaker(name="AI_SERVICE", failure_threshold=3, recovery_timeout=30)
