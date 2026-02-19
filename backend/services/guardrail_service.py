import re
from typing import List, Tuple
from backend.core.logger import logger

class GuardrailService:
    # Forbidden patterns in institutional legal AI output
    FORBIDDEN_PATTERNS = [
        (r"(?i)você é um estagiário", "AI Identity Protection"),
        (r"(?i)não tenho acesso a dados reais", "Data Quality Assurance"),
        (r"(?i)como um modelo de linguagem", "System Neutrality"),
        (r"(?i)erro interno no servidor", "UX Integrity"),
        (r"(?i)senha de acesso", "Security Leak Protection")
    ]
    
    @staticmethod
    def sanitise_output(text: str) -> Tuple[str, List[str]]:
        """
        Industrial AI Guardrail: Intercept and clean AI outputs.
        Returns (sanitized_text, list_of_violations).
        """
        violations = []
        sanitized = text
        
        for pattern, reason in GuardrailService.FORBIDDEN_PATTERNS:
            if re.search(pattern, sanitized):
                violations.append(reason)
                # Redact or replace if necessary. 
                # For now, we just flag and log.
                logger.warning(f"GUARDRAIL_VIOLATION: Detectado '{reason}' no output da IA.")
                
        # Mandatory Institutional Disclaimer if not present
        disclaimer = "\n\n---\n*Análise gerada via PROLOGOS Cognitive Engine. Sujeita a revisão humana.*"
        if disclaimer not in sanitized:
            sanitized += disclaimer
            
        return sanitized, violations

    @staticmethod
    def validate_input(text: str) -> bool:
        """Prevent Prompt Injection or malicious legal queries."""
        # Simple heuristic: look for typical injection patterns
        injection_patterns = [r"/ignore previous", r"system prompt", r"developer mode"]
        for p in injection_patterns:
            if re.search(p, text, re.IGNORECASE):
                logger.error(f"INJECTION_ATTEMPT: '{text[:50]}...'")
                return False
        return True
