from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.api import schemas
from backend.api import deps
from backend.repository.juiz_repository import JuizRepository
from backend.services.ai_service import AIService
from backend.services.audit_service import AuditService
from backend.core.logger import logger
from backend.core.exceptions import EntityNotFoundException

router = APIRouter()

@router.get("/", response_model=schemas.ResponseEnvelope[List[schemas.Juiz]])
async def get_juizes(
    request: Request,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    _permission: bool = Depends(deps.check_permission("list_magistrates"))
) -> Any:
    """Industrial list with compliance logging."""
    repo = JuizRepository(db)
    juizes = repo.get_multi(skip=skip, limit=limit)
    
    AuditService.log_action(
        db, 
        action="LIST_MAGISTRATES", 
        resource="juizes", 
        user_ip=request.client.host,
        user_agent=request.headers.get("User-Agent"),
        request_id=getattr(request.state, "request_id", None)
    )
    
    return schemas.ResponseEnvelope(data=juizes)

@router.get("/{juiz_id}/stats", response_model=schemas.ResponseEnvelope[dict])
async def get_juiz_stats(
    juiz_id: int,
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("list_magistrates"))
) -> Any:
    repo = JuizRepository(db)
    juiz = repo.get(juiz_id)
    if not juiz:
        raise EntityNotFoundException("Juiz", juiz_id)
    
    stats = {
        "id": juiz.id,
        "nome": juiz.nome,
        "total_decisoes": len(juiz.decisoes)
    }
    return schemas.ResponseEnvelope(data=stats)

@router.get("/health/ml", response_model=schemas.ResponseEnvelope[dict])
async def check_ml_health(
    _permission: bool = Depends(deps.check_permission("view_reports"))
) -> Any:
    health = AIService.get_health()
    return schemas.ResponseEnvelope(data=health)
