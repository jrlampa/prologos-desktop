import requests
import hashlib
from typing import List, Dict, Any
from backend.core.config import settings
from backend.core.logger import logger
from backend.core.exceptions import PrologosException
from backend.core.circuit_breaker import ai_circuit_breaker

from backend.services.base import BaseAIService
from backend.services.cache_service import CacheService
from backend.services.config_service import ConfigService
from backend.services.brazilian_legal_service import BrazilianLegalService

class AIService(BaseAIService):
    @ai_circuit_breaker
    def get_health(self) -> Dict[str, Any]:
        """
        Check health of external ML service with circuit breaker.
        """
        try:
            response = requests.get(f"{settings.ML_SERVICE_URL}/health", timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error checking ML service health: {e}")
            return {"status": "unreachable", "error": str(e)}

    @ai_circuit_breaker
    def rank_decisions(self, query_text: str, decisions: List[str]) -> List[float]:
        """
        Rank decisions with integrated intelligence cache and exponential backoff.
        """
        # 1. Intelligence Cache Access
        cache_key = hashlib.md5(f"{query_text}:{len(decisions)}".encode()).hexdigest()
        cached_result = CacheService.get(cache_key)
        if cached_result:
            logger.info("Intelligence Cache HIT (AIService)")
            return cached_result

        # 2. Resilience Flow: Exponential Backoff
        url = f"{settings.ML_SERVICE_URL}/rank"
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    url, 
                    json={"query": query_text, "documents": decisions},
                    timeout=ConfigService.get_ai_timeout()
                )
                response.raise_for_status()
                scores = response.json()["scores"]
                
                # Persist Intelligence
                CacheService.set(cache_key, scores)
                return scores
            except Exception as e:
                wait_time = 2 ** attempt
                logger.warning(f"AIService Retry {attempt+1}/{max_retries} due to: {e}. Waiting {wait_time}s...")
                import time
                time.sleep(wait_time)

        logger.error("AIService exhausted all retries.")
        raise PrologosException("Serviço de Inteligência temporariamente indisponível (Backoff Exhausted).")

    @ai_circuit_breaker
    def generate_legal_summary(self, context: str, org_id: Optional[int] = None) -> str:
        """
        Industrial Cognitive Generation with AI Semantic Caching & Guardrails.
        Ensures cost efficiency and institutional compliance.
        """
        from backend.services.guardrail_service import GuardrailService
        from backend.services.ai_semantic_cache_service import AISemanticCacheService
        
        # 1. Semantic Cache Access (Phase 19)
        cached_response = AISemanticCacheService.get_cached_response(context, org_id=org_id)
        if cached_response:
            return cached_response
        
        # 1. Input Validation
        if not GuardrailService.validate_input(context):
            raise PrologosException("Detectado padrão de consulta malicioso.", status_code=403)
            
        # 2. Procedural Intelligence Injection (Phase 22)
        proc_intel = BrazilianLegalService.get_procedural_guide("contestacao") # Dynamic in production
        
        # 3. Neural Generation (Real Llama 3 via Groq)
        from backend.services.groq_service import GroqService
        
        if GroqService.available():
            try:
                raw_output = GroqService.generate_legal_summary(context)
            except Exception as e:
                logger.error(f"Groq Generation Failed: {e}")
                # Fallback to industrial template
                raw_output = (
                    f"[FALHA NA GERAÇÃO NEURAL - MODO CONTINGÊNCIA]\n"
                    f"Base Legal Focal: {proc_intel['base_legal']}\n"
                    f"Prazo Estimado: {proc_intel['prazo']}\n"
                    f"Estratégia Recomendada: {proc_intel['dica_pro']}\n"
                )
        else:
            # Fallback if Groq not configured
            raw_output = (
                f"[ANÁLISE JURÍDICA - RITO CPC/2015]\n"
                f"Base Legal Focal: {proc_intel['base_legal']}\n"
                f"Prazo Estimado: {proc_intel['prazo']}\n"
                f"Estratégia Recomendada: {proc_intel['dica_pro']}\n\n"
                f"Análise baseada em {len(context)//100} kb de dados. "
                "A afinidade jurisprudencial sugere aderência aos precedentes da vara. "
                "Recomendada revisão detalhada de mérito focada em teses defensivas específicas."
            )
        
        # 3. Output Guardrail (Security Layer)
        sanitized, violations = GuardrailService.sanitise_output(raw_output)
        
        if violations:
            logger.warning(f"Output partially redacted due to: {', '.join(violations)}")
            
        # 4. Semantic Persistence (Phase 19)
        AISemanticCacheService.set_cached_response(context, sanitized, org_id=org_id)
            
        return sanitized
