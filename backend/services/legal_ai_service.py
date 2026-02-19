import logging
import json
import re
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from backend.services.groq_service import GroqService
from backend.services.vade_mecum_service import VadeMecumService
from backend.core.universal_schema import UniversalLegalRecord, Entity, Deadline

logger = logging.getLogger(__name__)

class LegalAIService:
    """
    Sovereign AI Analyst for Official Publications.
    Transforms raw DJe/DataJud text into structured UniversalLegalRecords.
    """

    @classmethod
    def analyze_publication(cls, raw_text: str, tribunal: str, process_number: str) -> UniversalLegalRecord:
        """
        Deep analysis of a publication using Groq/Llama3.
        Delegates parsing to LegalAIHelper (SRP focus).
        """
        from backend.services.legal_ai_helper import LegalAIHelper
        from backend.core.universal_schema import StatutoryAnchor
        
        logger.info(f"AI Analysis triggered for {process_number} ({tribunal})")
        
        # 1. Generate Summary, Risk, and Ritual via Groq
        prompt = (
            "Analise a publicação jurídica abaixo e extraia em formato JSON:\n"
            "1. 'summary': Resumo executivo (até 2 linhas).\n"
            "2. 'entities': Lista de objetos {'name', 'role'} (Advogado, Réu, Autor, Juiz).\n"
            "3. 'deadlines': Lista de objetos {'description', 'days'} (Número de dias úteis/corridos citados).\n"
            "4. 'risk_score': Valor de 0.0 a 1.0.\n"
            "5. 'rite': O rito processual detectado ('Ordinário', 'Sumaríssimo', 'Execução', 'Especial', 'Recursal').\n"
            "6. 'phase': A fase processual atual ('Postulatório', 'Saneamento', 'Instrução', 'Decisório', 'Recursal', 'Execução').\n"
            "7. 'next_step': O próximo rito/passo esperado no procedimento.\n"
            "8. 'tags': Lista de palavras-chave.\n\n"
            f"Texto: {raw_text}"
        )
        
        ai_raw = GroqService.analyze_case_text(prompt)
        
        # 2. Parse AI Response (SRP: Delegated)
        ai_data = LegalAIHelper.extract_structured_json(ai_raw)
        
        # 3. Build Record with Ritual Intelligence
        entities = [Entity(name=e['name'], role=e['role']) for e in ai_data.get('entities', [])]
        
        deadlines = []
        for d in ai_data.get('deadlines', []):
            days_count = LegalAIHelper.clean_day_string(d.get('days', '0'))
            deadlines.append(Deadline(
                description=d.get('description', 'Prazo Detectado'),
                date=datetime.now() + timedelta(days=days_count),
                criticality="HIGH" if days_count < 5 else "MEDIUM"
            ))

        # 4. Enrich with Statutory Mesh (Phase 43)
        detected_phase = ai_data.get('phase', 'Postulatório')
        raw_anchors = VadeMecumService.get_anchors_for_phase(detected_phase)
        
        # Convert raw anchors to type-safe StatutoryAnchor models
        legal_basis = [
            StatutoryAnchor(
                article=anchor.get("article", "N/A"),
                law=anchor.get("law", "CPC"),
                link=anchor.get("link")
            ) for anchor in raw_anchors
        ]

        return UniversalLegalRecord(
            id=f"AI-{datetime.now().strftime('%y%m%d')}-{hash(process_number) % 10000}",
            tribunal=tribunal,
            process_number=process_number,
            publication_date=datetime.now(),
            content=raw_text,
            entities=entities,
            deadlines=deadlines,
            ai_summary=ai_data.get('summary', "Análise em processamento..."),
            ai_risk_score=float(ai_data.get('risk_score', 0.0)),
            ai_tags=ai_data.get('tags', []),
            current_rite=ai_data.get('rite'),
            procedural_phase=detected_phase,
            next_ritual_step=ai_data.get('next_step'),
            legal_basis=legal_basis,
            raw_source="OfficialSourceConnector"
        )
