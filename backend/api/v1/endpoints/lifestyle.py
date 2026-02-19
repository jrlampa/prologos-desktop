from fastapi import APIRouter, Depends, Query
from typing import Any, List, Optional
from backend.api import schemas, deps
from backend.services.legislation_service import LegislationService
from backend.services.drafting_service import DraftingService

router = APIRouter()

@router.get("/legislation/lookup", response_model=schemas.ResponseEnvelope[dict])
def lookup_legislation(
    law: str = Query(..., description="Código da Lei (ex: CPC/15, CC/02)"),
    article: str = Query(..., description="Número do Artigo")
):
    """
    Vade Mecum Inteligente: Busca de artigos com interpretação via IA.
    """
    result = LegislationService.lookup_article(law, article)
    return schemas.ResponseEnvelope(data=result)

@router.get("/legislation/search", response_model=schemas.ResponseEnvelope[List[dict]])
def search_legislation(
    topic: str = Query(..., description="Tópico jurídico para busca")
):
    """
    Busca Semântica por Tópicos de Legislação.
    """
    results = LegislationService.search_by_topic(topic)
    return schemas.ResponseEnvelope(data=results)

@router.post("/drafting/generate", response_model=schemas.ResponseEnvelope[dict])
def generate_draft(
    thesis: str = Query(..., description="Título da Tese Jurídica"),
    context: Optional[str] = Query(None, description="Contexto específico do caso")
):
    """
    Assistente de Redação: Sugestão de rascunhos baseados em teses e jurisprudência.
    """
    result = DraftingService.generate_draft(thesis, context)
    return schemas.ResponseEnvelope(data=result)
