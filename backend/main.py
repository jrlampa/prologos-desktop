import uvicorn
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from backend.core.config import settings
from backend.core.logger import setup_logging, logger
from backend.core.exceptions import PrologosException
from backend.api.v1.api import api_router
from backend.api.middlewares import (
    RequestTracingMiddleware,
    RateLimitingMiddleware,
    PerformanceMetricMiddleware
)
from backend.api.deps import get_db
from backend.services.health_service import HealthService
from backend.repository.models import Base
from backend.core.database import engine

# 1. Initialization
setup_logging()
Base.metadata.create_all(bind=engine)

from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.sessions import SessionMiddleware

# ... (omitted)

# 2. Initialize App with Advanced Metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0-enterprise",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="🎯 **PRÓLOGOS Enterprise Backend**\n\n"
                "API de alta performance para análise jurimétrica e inteligência jurídica.\n\n"
                "### Funcionalidades:\n"
                "* 💎 **Análise de Afinidade**: Comparação técnica via ML Service\n"
                "* 📑 **Dossiê Prospect**: Geração consolidada de perfis\n"
                "* 🛡️ **Segurança**: TLS/SSL ready e auditoria de logs",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

from backend.api.middlewares import (
    ObservabilityMiddleware,
    CorrelationIDMiddleware,
    ResilienceMiddleware,
    IndustrialAuthenticationMiddleware,
    MultiTenancyMiddleware,
    AnalyticsMiddleware,
    MaintenanceMiddleware,
    SecurityHeadersMiddleware,
    RequestTracingMiddleware,
    RateLimitingMiddleware,
    PerformanceProfilingMiddleware
)

# 1.1 Self-Healing Background Orchestrator (Phase 20)
@app.on_event("startup")
async def start_self_healing_monitor():
    import asyncio
    from backend.services.self_healing_service import SelfHealingService
    
    async def monitor_loop():
        while True:
            try:
                # Proactive Integrity Check
                SelfHealingService.check_system_integrity()
            except Exception as e:
                from backend.core.logger import logger
                logger.error(f"Self-Healing Monitor Loop Error: {e}")
            await asyncio.sleep(60) # Industrial interval

    asyncio.create_task(monitor_loop())

# 2. Middleware Stack (Enterprise Order)
app.add_middleware(ObservabilityMiddleware)   # Span context absolute first
app.add_middleware(CorrelationIDMiddleware)   # Trace ID second
app.add_middleware(ResilienceMiddleware)      # Adaptive Retries third
app.add_middleware(IndustrialAuthenticationMiddleware) # Identity fourth
app.add_middleware(MultiTenancyMiddleware)     # Isolation fourth
app.add_middleware(AnalyticsMiddleware)       # Telemetry fifth
app.add_middleware(MaintenanceMiddleware)     # Check status fourth
app.add_middleware(SecurityHeadersMiddleware) # Protection fifth
app.add_middleware(RequestTracingMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(PerformanceProfilingMiddleware)
app.add_middleware(RateLimitingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Security & Observability Middlewares
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["*"]  # Configurar domínios reais em prod
)


# 4. Standardized Global Exception Handlers
@app.exception_handler(PrologosException)
async def prologos_exception_handler(request: Request, exc: PrologosException):
    logger.error(f"Business logic error: {exc.message} - Route: {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"ok": False, "detail": exc.message, "code": exc.__class__.__name__},
    )

from backend.api import schemas

# 5. Global Router Registration
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", response_model=schemas.ResponseEnvelope[dict], tags=["Infrastructure"])
def health_check(db: Session = Depends(get_db)):
    """Deep Enterprise health check."""
    status = HealthService.get_full_status(db)
    return schemas.ResponseEnvelope(data=status)

if __name__ == "__main__":
    logger.info(f"Boosting up {settings.PROJECT_NAME} API Layer...")
    # Em produção usaríamos variáveis de ambiente para host/port
    uvicorn.run(app, host="0.0.0.0", port=8001)
