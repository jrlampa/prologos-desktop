from typing import List, Dict, Any, Optional
from backend.core.logger import logger
import random

class JurisprudenceService:
    """
    Neural Jurisprudence Layer: Semantic search and court hierarchy logic.
    Provides lawyers with top-tier precedents (STF/STJ focus).
    """

    @staticmethod
    def semantic_search(query: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Performs vector-based semantic search for legal precedents.
        In a real PRO system, this would query a Milvus/Pinecone vector DB.
        """
        logger.info(f"Neural Search Triggered: {query}")
        
        # Simulated database of important precedents
        database = [
            {
                "id": 1,
                "tribunal": "STF",
                "relator": "Min. Gilmar Mendes",
                "ementa": "Recurso Extraordinário. Repercussão Geral. Direito Civil e Processual Civil.",
                "similaridade": 0.98,
                "data": "2024-11-12"
            },
            {
                "id": 2,
                "tribunal": "STJ",
                "relator": "Min. Nancy Andrighi",
                "ementa": "Recurso Especial. Direito do Consumidor. Inscrição Indevida.",
                "similaridade": 0.94,
                "data": "2025-01-20"
            },
            {
                "id": 3,
                "tribunal": "TJSP",
                "relator": "Des. Paulo Alcides",
                "ementa": "Apelação. Dano Moral. Quantum indenizatório.",
                "similaridade": 0.89,
                "data": "2025-02-05"
            }
        ]
        
        # Sort by Tribunal hierarchy (STF > STJ > TJs) then similarity
        order = {"STF": 0, "STJ": 1, "TJSP": 2, "TJRJ": 2}
        
        sorted_results = sorted(
            database, 
            key=lambda x: (order.get(x["tribunal"], 99), -x["similaridade"])
        )
        
        return sorted_results

    @staticmethod
    def get_precedent_weight(tribunal: str) -> float:
        """Calculates the persuasive weight of a precedent."""
        weights = {"STF": 1.0, "STJ": 0.8, "TJSP": 0.6, "TJRJ": 0.6}
        return weights.get(tribunal, 0.4)
