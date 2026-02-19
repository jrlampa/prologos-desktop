from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import Any
from backend.api import schemas, deps
from backend.services.brazilian_legal_service import BrazilianLegalService

router = APIRouter()

@router.get("/calculate-deadline", response_model=schemas.ResponseEnvelope[dict])
def calculate_brazilian_deadline(
    start_date: str = Query(..., description="Data de início (ISO)"),
    days: int = Query(..., description="Quantidade de dias"),
    is_working_days: bool = Query(True, description="Contar apenas dias úteis (CPC)")
):
    """
    Calcula prazos processuais conforme o CPC/2015 brasileiro.
    """
    try:
        dt_start = datetime.fromisoformat(start_date)
        dt_end = BrazilianLegalService.calculate_deadline(dt_start, days, is_working_days)
        return schemas.ResponseEnvelope(data={
            "start_date": start_date,
            "deadline_date": dt_end.isoformat(),
            "days": days,
            "is_working_days": is_working_days,
            "legal_basis": "Art. 219, CPC (Dias Úteis)" if is_working_days else "Dias Corridos"
        })
    except Exception as e:
        from backend.core.exceptions import PrologosException
        raise PrologosException(f"Erro no cálculo de prazo: {str(e)}", status_code=400)

@router.get("/procedural-guide/{context}", response_model=schemas.ResponseEnvelope[dict])
def get_legal_guide(context: str):
    """
    Retorna guia procedural especializado para advogados brasileiros.
    """
    guide = BrazilianLegalService.get_procedural_guide(context)
    return schemas.ResponseEnvelope(data=guide)
