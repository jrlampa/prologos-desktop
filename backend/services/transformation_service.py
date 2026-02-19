from typing import Dict, Any, List
from backend.services.normalization_service import NormalizationService
from backend.core.logger import logger

class TransformationService:
    @staticmethod
    def enrich_judge_profile(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orchestrate normalization and enrichment of magistrate profiles.
        """
        logger.info(f"Initiating Enrichment for Magistrate: {raw_data.get('nome')}")
        
        # 1. Base Normalization
        enriched = {
            "nome": NormalizationService.clean_legal_text(raw_data.get("nome", "")),
            "tribunal": raw_data.get("tribunal", "Desconhecido"),
            "vara": NormalizationService.clean_legal_text(raw_data.get("vara", "Não informada")),
            "processos": []
        }
        
        # 2. Case Normalization & Noise Removal
        raw_cases = raw_data.get("processos", [])
        for case in raw_cases:
            cleaned_case = {
                "numero": case.get("numero", "N/A"),
                "data": case.get("data"),
                "tipo": case.get("tipo", "Geral"),
                "resumo": NormalizationService.clean_legal_text(case.get("resumo", ""))
            }
            enriched["processos"].append(cleaned_case)
            
        # 3. Statistical Enrichment (Industrial Metadata)
        enriched["metadata"] = {
            "total_cases_analyzed": len(enriched["processos"]),
            "data_quality_score": TransformationService._calculate_quality(enriched),
            "transformation_standard": "PRÓLOGOS-E10"
        }
        
        return enriched

    @staticmethod
    def _calculate_quality(data: Dict[str, Any]) -> float:
        """Heuristic for data completeness."""
        score = 0.0
        if data.get("nome"): score += 0.4
        if data.get("vara"): score += 0.2
        if data.get("processos"): score += 0.4
        return score
