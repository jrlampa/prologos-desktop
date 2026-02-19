from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.api import schemas
import backend.api.deps as deps
from backend.services.validation_service import ValidationService
from typing import Any

router = APIRouter()

@router.post("/validate-cnj", response_model=schemas.ResponseEnvelope[dict])
async def validate_cnj(
    cnj_number: str,
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("view_reports"))
) -> Any:
    """
    Industrial validation of CNJ process numbers.
    Ensures data integrity for institutional reporting.
    """
    is_valid = ValidationService.validate_cnj(cnj_number)
    
    return schemas.ResponseEnvelope(
        data={
            "cnj_number": cnj_number,
            "is_valid": is_valid,
            "standard": "CNJ / Conselho Nacional de Justiça"
        },
        detail="Validado com sucesso via PROLOGOS Validation Core" if is_valid else "Formato de processo inválido"
    )

@router.post("/trigger-industrial-cleanup", response_model=schemas.ResponseEnvelope[dict])
async def trigger_industrial_cleanup(
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("view_reports"))
) -> Any:
    """
    Manually trigger the Industrial Data Lifecycle process.
    Moves old audit logs to Cold Storage based on retention policy.
    """
    from backend.services.archiving_service import ArchivingService
    count = ArchivingService.archive_old_audit_logs(db)
    stats = ArchivingService.get_archive_stats(db)
    
    return schemas.ResponseEnvelope(data={
        "sucesso": True,
        "archived_count": count,
        "storage_stats": stats,
        "message": f"Limpeza industrial concluída. {count} registros movidos para Cold Storage."
    })
