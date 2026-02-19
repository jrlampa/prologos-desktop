import logging
import json
import re
from typing import Dict, Any, List
from backend.services.groq_service import GroqService
from backend.services.vade_mecum_service import VadeMecumService

logger = logging.getLogger(__name__)

class DialecticAIService:
    """
    Sovereign Dialectic Strategy Engine.
    Implements Thesis-Antithesis-Synthesis logic for legal argumentation.
    """

    @classmethod
    def generate_strategy(cls, thesis: str, phase: str = "Postulatório") -> Dict[str, str]:
        """
        Generates a dialectic strategy based on a lawyer's thesis.
        """
        logger.info(f"Generating dialectic strategy for thesis: {thesis[:50]}...")

        prompt = (
            "Você é um estrategista jurídico sênior e um 'Advogado do Diabo'.\n"
            "Dada a Tese (argumento do advogado) abaixo, realize uma análise dialética:\n"
            "1. 'antithesis': Simule a contra-argumentação da parte contrária ou do juízo. Seja crítico e aponte falhas.\n"
            "2. 'synthesis': Formule uma estratégia vencedora que neutralize a antítese, reforçando o argumento original com base na lei.\n"
            "3. 'suggested_articles': Lista de artigos do CPC ou leis relevantes para apoiar a síntese.\n\n"
            f"Fase Processual: {phase}\n"
            f"Tese: {thesis}\n\n"
            "Responda EXCLUSIVAMENTE em formato JSON com as chaves indicadas."
        )

        ai_raw = GroqService.analyze_case_text(prompt)
        ai_data = cls._parse_ai_json(ai_raw)

        # Enrich Synthesis with Vade Mecum links
        synthesis = ai_data.get('synthesis', "")
        suggested_articles = ai_data.get('suggested_articles', [])
        
        # Heuristic anchoring
        anchors = VadeMecumService.get_links_for_text(synthesis)
        for art in suggested_articles:
             anchors.extend(VadeMecumService.get_links_for_text(art))

        return {
            "thesis": thesis,
            "antithesis": ai_data.get('antithesis', "Oposição não detectada."),
            "synthesis": synthesis,
            "anchors": anchors
        }

    @staticmethod
    def _parse_ai_json(raw_response: str) -> Dict[str, Any]:
        try:
            match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {}
        except Exception as e:
            logger.error(f"Failed to parse Dialectic JSON: {e}")
            return {"antithesis": "Erro ao processar dialética.", "synthesis": raw_response}
