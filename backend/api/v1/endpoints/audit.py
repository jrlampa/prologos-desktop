from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.services.audit_service import AuditService
from backend.services.user_service import User

router = APIRouter()

@router.get("/logs", response_model=List[dict])
def read_audit_logs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    limit: int = 100
) -> Any:
    """
    Retrieve Sovereign Audit Logs.
    Only accessible to 'admin' or 'auditor' roles.
    """
    if current_user.role not in ["admin", "auditor"]:
        raise HTTPException(
            status_code=403, 
            detail="Acesso restrito ao painel de auditoria soberana."
        )
    
    logs = AuditService.get_logs(db, org_id=current_user.org_id, limit=limit)
    
    # Format for JSON response
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat(),
            "action": log.action,
            "resource": log.resource,
            "user_ip": log.user_ip,
            "details": log.details
        } for log in logs
    ]
