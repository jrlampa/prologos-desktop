from typing import List, Dict, Any, Optional
from backend.core.logger import logger
from backend.services.jurisprudence_service import JurisprudenceService

class DraftingService:
    """
    Legal Drafting Assistant: Generates AI-powered snippets for defensive theses.
    Integrates with JurisprudenceService to provide data-driven legal arguments.
    """

    @staticmethod
    def generate_draft(thesis_title: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a legal draft snippet based on a theme and current jurisprudence.
        """
        logger.info(f"Generating Legal Draft for: {thesis_title}")
        
        # In a real system, this would use a LLM with RAG (Retrieval Augmented Generation)
        # searching through the JurisprudenceService results.
        
        precedents = JurisprudenceService.semantic_search(thesis_title)
        top_precedent = precedents[0] if precedents else {"ementa": "Doutrina majoritária aplicada.", "tribunal": "Cortes Superiores"}

        drafts = {
            "dano moral": (
                f"Conforme entendimento consolidado do {top_precedent['tribunal']}, "
                "a configuração do dano moral exige a demonstração inequívoca de violação "
                "ao direito da personalidade, extrapolando o mero aborrecimento. "
                f"No caso em tela, observa-se que {context or 'os fatos narrados não atingem o patamar indenizável'}."
            ),
            "contestação": (
                "Em sede de contestação, impugna-se especificamente todos os fatos narrados na exordial. "
                "A pretensão autoral carece de suporte jurídico, uma vez que não restou comprovado o nexo causal..."
            )
        }

        # AI Guardrails: Validate Context Safety
        DraftingService._check_guardrails(thesis_title, context)
        
        from backend.services.groq_service import GroqService
        
        if GroqService.available():
            content = GroqService.generate_legal_draft(thesis_title, context)
        else:
            content = drafts.get(thesis_title.lower(), (
                f"Tese defensiva baseada em precedentes do {top_precedent['tribunal']}. "
                "Sugere-se focar na ausência de nexo de causalidade e na aplicação do princípio da razoabilidade."
            ))

        return {
            "title": thesis_title,
            "snippet": content,
            "source_precedent": top_precedent,
            "recommended_actions": ["Citar Art. 186 CC", "Anexar comprovantes de boa-fé"],
            "safety_check": "PASSED"
        }

    @staticmethod
    def _check_guardrails(thesis: str, context: Optional[str]):
        """
        Internal Guardrail: Prevents generation of unethical or obsolete legal content.
        """
        risky_terms = ["fraude processual", "mentira", "falso testemunho", "suborno"]
        if context:
            for term in risky_terms:
                if term in context.lower():
                    logger.warning(f"GUARDRAIL BLOCKED: Risky term detected - {term}")
                    raise ValueError(f"Conteúdo bloqueado por violação ética: Uso de termo de risco detectado ({term}).")
        
        # In a real scenario, this would check against a vector database of 'bad patterns'.
        logger.info("Guardrail Check: SAFE")
