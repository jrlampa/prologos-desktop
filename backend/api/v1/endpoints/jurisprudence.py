from fastapi import APIRouter, Depends, Query, Request
from typing import Any, List
from backend.api import schemas, deps
from backend.services.jurisprudence_service import JurisprudenceService
from backend.services.reporting_service import ReportingService

router = APIRouter()

@router.get("/search", response_model=schemas.ResponseEnvelope[List[dict]])
def search_jurisprudence(
    query: str = Query(..., description="Termo de busca jurídica"),
    tribunais: Optional[List[str]] = Query(None, description="Filtrar por tribunais")
):
    """
    Busca Semântica Neural por Jurisprudência e Precedentes.
    Prioriza tribunais superiores e similaridade vetorial.
    """
    results = JurisprudenceService.semantic_search(query, filters={"tribunais": tribunais})
    return schemas.ResponseEnvelope(data=results)

@router.post("/generate-report", response_model=schemas.ResponseEnvelope[dict])
def generate_strategic_report(
    request: Request,
    _ = Depends(deps.check_permission("advogado"))
):
    """
    Geração Automática de Relatório Estratégico para Clientes.
    Consolida métricas e precedentes em um sumário executivo.
    """
    org_id = getattr(request.state, "org_id", 1)
    report = ReportingService.generate_executive_report(org_id, {})
    return schemas.ResponseEnvelope(data=report)
