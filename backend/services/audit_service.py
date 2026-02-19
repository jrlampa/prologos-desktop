import json
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.repository.models import AuditLog
from backend.core.logger import logger

class AuditService:
    @staticmethod
    def log_action(
        db: Session, 
        action: str, 
        resource: str, 
        user_ip: str, 
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        org_id: Optional[int] = None
    ):
        """
        Record an industrial audit trace with Institutional Scoping.
        Now supports structured JSON details for deep forensics.
        """
        try:
            details_str = json.dumps(details) if details else None
            log_entry = AuditLog(
                org_id=org_id,
                action=action,
                resource=resource,
                user_ip=user_ip,
                user_agent=user_agent,
                request_id=request_id,
                details=details_str
            )
            db.add(log_entry)
            db.commit()
            logger.info(f"AUDIT_TRACE [Org:{org_id}]: {action} on {resource} via {user_ip} [ReqID: {request_id}]")
        except Exception as e:
            logger.error(f"Critical Audit Failure: {e}")
            db.rollback()

    @staticmethod
    def get_logs(db: Session, org_id: Optional[int] = None, limit: int = 50) -> List[AuditLog]:
        """Retrieves recent audit logs for the Sovereign Dashboard."""
        query = db.query(AuditLog)
        if org_id:
            query = query.filter(AuditLog.org_id == org_id)
        return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
