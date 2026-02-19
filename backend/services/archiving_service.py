from typing import Optional
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import delete
from backend.repository.models import AuditLog, AuditLogArchive
from backend.services.config_service import ConfigService
from backend.core.logger import logger

class ArchivingService:
    @staticmethod
    def archive_old_audit_logs(db: Session) -> int:
        """
        Industrial Data Lifecycle: Move old audit logs from Hot to Cold storage.
        Returns the number of records archived.
        """
        try:
            retention_days = ConfigService.get_audit_retention_days()
            cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=retention_days)
            
            # 1. Identify records to archive
            old_logs = db.query(AuditLog).filter(AuditLog.timestamp < cutoff_date).all()
            if not old_logs:
                return 0
                
            logger.info(f"Starting Industrial Archiving: {len(old_logs)} records found (Cutoff: {cutoff_date})")
            
            # 2. Bulk Insert to Archive
            archive_entries = []
            for log in old_logs:
                archive_entries.append(AuditLogArchive(
                    org_id=log.org_id,
                    original_id=log.id,
                    timestamp=log.timestamp,
                    user_ip=log.user_ip,
                    user_agent=log.user_agent,
                    request_id=log.request_id,
                    action=log.action,
                    resource=log.resource,
                    details=log.details
                ))
            
            db.bulk_save_objects(archive_entries)
            
            # 3. Clean up Hot Storage
            ids_to_delete = [log.id for log in old_logs]
            # Efficient delete using IN clause
            db.execute(
                delete(AuditLog).where(AuditLog.id.in_(ids_to_delete))
            )
            
            db.commit()
            logger.info(f"Archiving Complete: {len(old_logs)} records moved to Cold Storage.")
            
            # 4. Institutional Event
            from backend.services.event_service import EventService
            EventService.emit_event(db, "system.archiving_complete", {
                "archived_count": len(old_logs),
                "cutoff_date": str(cutoff_date),
                "timestamp": str(datetime.datetime.utcnow())
            })
            
            return len(old_logs)
            
        except Exception as e:
            db.rollback()
            logger.error(f"Industrial Archiving Error: {e}")
            return 0

    @staticmethod
    def get_archive_stats(db: Session, org_id: Optional[int] = None) -> dict:
        """Dashboard Ready: Statistics about tiered storage usage with Scoping."""
        query_hot = db.query(AuditLog)
        query_cold = db.query(AuditLogArchive)
        
        if org_id:
            query_hot = query_hot.filter(AuditLog.org_id == org_id)
            query_cold = query_cold.filter(AuditLogArchive.org_id == org_id)
            
        hot_count = query_hot.count()
        cold_count = query_cold.count()
        
        return {
            "hot_storage_records": hot_count,
            "cold_storage_records": cold_count,
            "total_audit_records": hot_count + cold_count,
            "tiering_efficiency": (cold_count / (hot_count + cold_count)) if (hot_count + cold_count) > 0 else 0
        }
