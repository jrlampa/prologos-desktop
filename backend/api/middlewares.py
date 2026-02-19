from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from backend.core.queue import get_redis
from backend.core.logger import logger, correlation_id_ctx
import time
import uuid

class CorrelationIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        token = correlation_id_ctx.set(correlation_id)
        try:
            response = await call_next(request)
            response.headers["X-Correlation-ID"] = correlation_id
            return response
        finally:
            correlation_id_ctx.reset(token)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

class RateLimitingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        from backend.services.security_service import SecurityService
        
        # 1. Retrieve Identity Tier from state (populated by AuthMiddleware)
        tier = getattr(request.state, "tier", "standard")
        limit = SecurityService.get_tier_limit(tier)
        
        if "/ml/" in request.url.path or "/analise/" in request.url.path:
            client_ip = request.client.host
            key = f"rate_limit:{client_ip}"
            try:
                redis = get_redis()
                count = redis.incr(key)
                if count == 1:
                    redis.expire(key, 60)
                
                if count > limit:
                    logger.warning(f"Rate limit exceeded [{tier}]: {client_ip}")
                    return JSONResponse(
                        status_code=429,
                        content={
                            "ok": False, 
                            "detail": f"Limite industrial de {limit} req/min atingido para o nível {tier}."
                        }
                    )
            except Exception as e:
                logger.error(f"Rate Limiter Redis Error: {e}")
        
        return await call_next(request)

class IndustrialAuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        from backend.services.security_service import SecurityService
        from backend.api.deps import SessionLocal
        
        api_key = request.headers.get("X-API-Key")
        if not api_key:
            # Pass-through for public routes (e.g. /health), dependencies will handle protection
            request.state.tier = "standard"
            return await call_next(request)
            
        db = SessionLocal()
        try:
            key_obj = SecurityService.validate_api_key(db, api_key)
            if key_obj:
                request.state.user_role = key_obj.user.role
                request.state.tier = key_obj.tier
                request.state.api_key_id = key_obj.id
            else:
                request.state.tier = "standard"
        finally:
            db.close()
            
        return await call_next(request)

class AnalyticsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        from backend.services.analytics_service import AnalyticsService
        
        # 1. Capture Telemetry before processing
        AnalyticsService.track_request(
            route=request.url.path,
            method=request.method,
            ip=request.client.host
        )
        
        return await call_next(request)

class PerformanceProfilingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Logar rotas lentas (> 5s)
        if duration > 5.0:
            logger.warning(f"SLOW ROUTE DETECTED: {request.url.path} took {duration:.2f}s")
            
        return response

class RequestTracingMiddleware(BaseHTTPMiddleware):
    # ... (rest of class)
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        # Tornar o ID acessível para outros componentes via estado do request
        request.state.request_id = request_id
        
        start_time = time.time()
        
        # Log de entrada
        logger.info(f"Incoming request: {request.method} {request.url.path} [RequestID: {request_id}]")
        
        response = await call_next(request)
        
        # Log de saída com tempo de processamento
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = "{0:.2f}".format(process_time)
        
        logger.info(
            f"Completed request: {request.method} {request.url.path} "
            f"Status: {response.status_code} Time: {formatted_process_time}ms [RequestID: {request_id}]"
        )
        
        # Adicionar o ID no header da resposta para o cliente/audit
        response.headers["X-Request-ID"] = request_id
        return response

class MaintenanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        from backend.services.config_service import ConfigService
        
        # Bypass health check to allow monitoring during maintenance
        if request.url.path == "/health":
            return await call_next(request)
            
        if ConfigService.is_maintenance_mode():
            logger.warning(f"Blocking request due to Maintenance Mode: {request.url.path}")
            return JSONResponse(
                status_code=503,
                content={
                    "ok": False, 
                    "detail": "O sistema está em manutenção programada para melhorias enterprise. Tente novamente em instantes.",
                    "retry_after": 300
                }
            )
            
        return await call_next(request)

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        """
        Industrial Observability: Capture distributed spans for every request.
        """
        from backend.services.observability_service import ObservabilityService
        
        # 1. Start Trace Context
        trace_id = ObservabilityService.start_trace()
        request.state.trace_id = trace_id
        start_time = time.time()
        
        # 2. Process Request
        response = await call_next(request)
        
        # 3. Finalize Span
        duration_ms = (time.time() - start_time) * 1000
        ObservabilityService.record_span(
            trace_id=trace_id,
            span_name=f"{request.method} {request.url.path}",
            duration_ms=duration_ms,
            metadata={
                "status_code": response.status_code,
                "org_id": getattr(request.state, "org_id", None)
            }
        )
        
        # 4. Propagate Trace ID
        response.headers["X-Trace-ID"] = trace_id
            
        return response

class MultiTenancyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        """
        Industrial Multi-Tenancy: Resolve organizational identity.
        Ensures data isolation across different institutional units.
        """
        # 1. Resolve Tenant ID from Header
        tenant_id = request.headers.get("X-Tenant-ID")
        
        # 2. Prefer API Key's Org if available (Identity-based Tenancy)
        api_key_id = getattr(request.state, "api_key_id", None)
        if api_key_id:
            from backend.api.deps import SessionLocal
            from backend.repository.models import APIKey
            db = SessionLocal()
            try:
                key_obj = db.query(APIKey).filter(APIKey.id == api_key_id).first()
                if key_obj and key_obj.org_id:
                    tenant_id = str(key_obj.org_id)
            finally:
                db.close()

        # 3. Inject into Request State for downstream scoping
        request.state.org_id = int(tenant_id) if tenant_id and tenant_id.isdigit() else None
        
        response = await call_next(request)
        
        # 4. Echo resolved tenant for awareness
        if request.state.org_id:
            response.headers["X-Tenant-ID"] = str(request.state.org_id)
            
        return response

class SurveillanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        from backend.services.surveillance_service import SurveillanceService
        
        # 1. Skip if not authenticated or public route
        api_key_id = getattr(request.state, "api_key_id", None)
        if not api_key_id:
            return await call_next(request)
            
        # 2. Record Activity
        SurveillanceService.record_activity(str(api_key_id))
        
        # 3. Evaluate Threat Level
        threat = SurveillanceService.evaluate_threat(str(api_key_id))
        if threat["is_threat"]:
            logger.critical(f"SURVEILLANCE_LOCKDOWN: Blocking threat from key {api_key_id} (Score: {threat['score']})")
            return JSONResponse(
                status_code=403,
                content={
                    "ok": False,
                    "detail": "Acesso bloqueado por Vigilância Preditiva. Comportamento anômalo detectado.",
                    "risk_score": threat["score"]
                }
            )
            
        try:
            response = await call_next(request)
            
            # 4. Penalty for errors (Post-execution)
            if response.status_code >= 400:
                SurveillanceService.record_activity(str(api_key_id), is_error=True)
                
            return response
        except Exception as e:
            SurveillanceMiddleware.record_activity(str(api_key_id), is_error=True)
            raise e

class ResilienceMiddleware(BaseHTTPMiddleware):
    """
    Industrial Resilience Layer (Phase 20).
    Implements adaptive retries with Exponential Backoff and Jitter.
    Handles transient network/upstream failures and service overloads.
    """
    async def dispatch(self, request: Request, call_next):
        import time
        import random
        from starlette.responses import JSONResponse
        
        # Identity Awareness check
        is_safe_to_retry = request.method in ["GET", "HEAD", "OPTIONS"]
        max_retries = 3 if is_safe_to_retry else 1 # Be careful with non-idempotent methods
        
        for attempt in range(max_retries):
            try:
                response = await call_next(request)
                if response.status_code not in [502, 503, 504]:
                    return response
                
                # If we've hit max retries, return the last response
                if attempt == max_retries - 1:
                    logger.error(f"RESILIENCE: Max retries reached for {request.url.path}")
                    return response
                    
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.critical(f"RESILIENCE: Critical failure during retry loop: {e}")
                    raise e
            
            # Exponential Backoff with Jitter (Phase 20 logic)
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            logger.warning(f"RESILIENCE: Transient failure detected. Retry {attempt+1}/{max_retries} in {wait_time:.2f}s")
            time.sleep(wait_time)
            
        return JSONResponse(status_code=503, content={"detail": "Serviço temporariamente sobrecarregado (Resilience Exhausted)."})
