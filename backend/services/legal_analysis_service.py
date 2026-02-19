from typing import List, Dict, Any
from backend.core.logger import logger

class LegalAnalysisService:
    CLASSIFICATION_RULES = {
        "CONSUMIDOR": ["banco", "telefonia", "indemnização", "danos morais", "consumidor", "aérea"],
        "TRABALHISTA": ["horas extras", "rescisão", "trabalho", "vínculo"],
        "TRIBUTARIO": ["imposto", "taxa", "execução fiscal", "icms"],
        "CIVIL": ["contrato", "posse", "família", "sucessões"],
    }
    
    RISK_RULES = {
        "ALTO": ["tutela", "liminar", "urgência", "crime"],
        "MEDIO": ["indenização", "cobranca", "monitória"],
        "BAIXO": ["homologação", "administrativo"],
    }

    @staticmethod
    def classify_decision(text: str) -> Dict[str, Any]:
        """
        Industrial engine for legal text classification.
        """
        # Padrão Regra de Negócio Centralizada
        RULES = {
            "PROCEDENTE": ["defiro", "julgo procedente", "acolho o pedido"],
            "IMPROCEDENTE": ["indefiro", "julgo improcedente", "rejeito"],
            "EXTINTO": ["extingo o processo", "sem resolução de mérito"]
        }
        
        text_lower = text.lower()
        for label, patterns in RULES.items():
            if any(p in text_lower for p in patterns):
                return {"label": label, "confidence": 1.0}
        
        return {"label": "OUTROS", "confidence": 0.5}

    @staticmethod
    def get_judge_stats(decisions: List[Any]) -> Dict[str, Any]:
        """
        Calculate statistics for industrial reporting.
        """
        total = len(decisions)
        if total == 0: return {"total": 0}
        
        counts = {}
        for d in decisions:
            counts[d.resultado] = counts.get(d.resultado, 0) + 1
            
        return {
            "total": total,
            "distribution": counts,
            "win_rate": counts.get("PROCEDENTE", 0) / total
        }
