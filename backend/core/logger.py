import logging
import sys
import json
import datetime
from contextvars import ContextVar

# Contextual Storage for Tracing
correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="system")

class JSONLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_object = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.name,
            "correlation_id": correlation_id_ctx.get(),
            "filename": record.filename,
            "line": record.lineno
        }
        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)  # type: ignore
        return json.dumps(log_object)

def setup_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONLogFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]
    
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

logger = logging.getLogger("prologos-backend")
