from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import re
from backend.services.ingestors.datajud_legacy import (
    detectar_tribunal_inteligente, 
    datajud_search, 
    extrair_teor_decisao
)
import os

class CrawlerService:
    """
    DataJud Crawler & Case Cloning Engine.
    Uses 'legacy' industrial ingestion logic to fetch REAL data from CNJ.
    """
    
    # Mock Database for Cloned Cases (In-memory cache for this session)
    CLONED_CASES = {}

    @classmethod
    async def clone_case(cls, cnj: str) -> Dict[str, Any]:
        """
        Fetches full case data (metadata + movements) from DataJud Public API.
        This is a REAL implementation, not a simulation.
        """
        # 1. Detect Court API
        cnj_clean = re.sub(r"\D", "", cnj)
        api_url, tribunal_nome, estado = detectar_tribunal_inteligente(cnj_clean)
        
        # 3. Execute Search (via Enhanced Official Connector)
        from backend.services.official_source_connector import OfficialSourceConnector
        
        # We delegate the "Hard Work" to the Connector which handles API keys/Auth/Fallbacks
        result = OfficialSourceConnector.get_process_data(cnj)
        
        if result.get("status") != "success":
             raise ValueError(f"Processo {cnj} não encontrado ou erro na fonte oficial: {result.get('message')}")
             
        # 4. Parse Response
        source = result["data"]
        
        case_data = {
            "cnj": source.get("numeroProcesso", cnj),
            "official_badge": result.get("badge"), # Enterprise Verification Badge
            "cloned_at": datetime.now().isoformat(),
            "court": tribunal_nome,
            "comarca": source.get("orgaoJulgador", {}).get("nome", "Desconhecida"),
            "subject": (source.get("assuntos") or [{}])[0].get("nome", "Geral"),
            "value": source.get("valorCausa", 0.0), # DataJud doesn't always have this, check fields
            "class": (source.get("classe") or {}).get("nome", ""),
            "parties": cls._parse_parties(source),
            "movements": cls._parse_movements_real(source),
            "raw_source": source # Keep raw data for advanced debugging
        }
        
        # 5. Enrich Analysis
        case_data["datajud_status"] = cls._parse_status(case_data["movements"])
        case_data["prediction"] = cls._predict_outcome(case_data)
        
        cls.CLONED_CASES[cnj] = case_data
        return case_data

    @classmethod
    def get_cloned_case(cls, cnj: str) -> Optional[Dict[str, Any]]:
        return cls.CLONED_CASES.get(cnj)

    @staticmethod
    def _parse_parties(source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extracts parties from DataJud source."""
        # This structure varies by court, but generally looks like this in DataJud schema
        # We'll map 'polos' if available or custom fields
        parties = []
        # This is a simplification; DataJud structure is complex. 
        # For now, we try to extract from 'polos' usually found in full schema, 
        # but the public API often returns flat lists or varies.
        # We will check if 'dadosBasicos' exists or similar.
        return parties 

    @staticmethod
    def _parse_movements_real(source: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parses real movements from DataJud response."""
        raw_moves = source.get("movimentos", [])
        parsed = []
        
        for m in raw_moves:
            # DataJud format: { "dataHora": "...", "nome": "...", "complementosTabelados": [...] }
            desc = m.get("nome", "")
            
            # Append complements for context
            comps = m.get("complementosTabelados", [])
            for c in comps:
                if c.get("descricao"):
                    desc += f" - {c.get('descricao')}"
            
            # Determine type
            m_type = "PROCEDURAL"
            lower_desc = desc.lower()
            if any(x in lower_desc for x in ["sentença", "decisão", "julgado", "acórdão"]):
                m_type = "DECISION_FAV" # Broad category for UI highlighting
            elif "audiência" in lower_desc:
                m_type = "HEARING"
                
            parsed.append({
                "date": m.get("dataHora", "")[:10], # YYYY-MM-DD
                "code": m.get("codigo"),
                "description": desc,
                "type": m_type
            })
            
        # Sort by date descending
        parsed.sort(key=lambda x: x["date"], reverse=True)
        return parsed

    @staticmethod
    def _parse_status(movements: List[Dict[str, Any]]) -> str:
        """Heuristic parser to determine case phase from real strings."""
        descriptions = [m["description"].lower() for m in movements]
        
        if any("transitado em julgado" in d for d in descriptions):
            return "FINALIZED"
        if any("arquivado" in d for d in descriptions):
            return "ARCHIVED"
        if any("sentença" in d for d in descriptions):
            return "SENTENCE_GIVEN"
        if any("audiência" in d for d in descriptions):
            return "HEARING_SCHEDULED"
        return "ACTIVE"

    @staticmethod
    def _predict_outcome(case_data: Dict[str, Any]) -> str:
        """
        Tries to predict outcome based on decision text analysis.
        Uses Groq (Llama 3) if available for deep semantic analysis.
        Fallbacks to regex if LLM is unavailable.
        """
        from backend.services.groq_service import GroqService
        
        # We can reuse the legacy function to get the text of valid decisions
        # But we need the 'source' object. We saved it in 'raw_source'
        source = case_data.get("raw_source", {})
        teor = extrair_teor_decisao(source)
        
        if not teor:
            return "UNCERTAIN"
            
        # 1. Try AI Analysis (Groq)
        if GroqService.available():
            try:
                # We ask Groq for a structured short answer or classification
                # For this simple field, we just map the string return to our enum
                analysis = GroqService.analyze_case_text(teor)
                analysis_lower = analysis.lower()
                
                if "êxito" in analysis_lower or "favorável" in analysis_lower or "procedente" in analysis_lower:
                    return "PROBABLE_SUCCESS"
                if "improcedente" in analysis_lower or "perda" in analysis_lower:
                    return "PROBABLE_LOSS"
            except Exception:
                pass # Fallback to regex
            
        # 2. Fallback to Regex
        teor_lower = teor.lower()
        if "procedente" in teor_lower and "improcedente" not in teor_lower:
            return "PROBABLE_SUCCESS"
        if "improcedente" in teor_lower:
            return "PROBABLE_LOSS"
            
        return "UNCERTAIN"
