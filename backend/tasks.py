from __future__ import annotations

import logging
from typing import Any, Dict # Kept because Dict is used in function signature
from backend.api import schemas
from backend.repository.models import Juiz, Decisao, Tribunal
from backend.core.database import SessionLocal
from backend.core.logger import logger # This imports a logger, but it's immediately overwritten below
from backend.services.datajud_service import DataJudService

from backend.services.validation_service import ValidationService

logger = logging.getLogger("prologos.jobs")

def clone_juiz_datajud_task(numero_processo: str) -> Dict[str, Any]:
    """
    Tarefa de clonagem (DataJud) para rodar em worker (RQ).
    Hardened with pre-flight CNJ validation and atomic integrity.
    """
    # 0. Pre-flight Validation
    ValidationService.ensure_cnj(numero_processo)
    
    job = get_current_job()
    job_id = job.get_id() if job else "local"
    
    logger.info(f"[jobId={job_id}] Received task for process: {numero_processo}")
    
    def progress_cb(percent, msg):
        if job:
            job.meta["progress"] = percent
            job.meta["status_msg"] = msg
            job.save_meta()
        logger.info(f"[jobId={job_id}] Progress {percent}%: {msg}")

    progress_cb(1, "Iniciando clonagem (DataJud Service)…")

    try:
        payload = DataJudService.clone_judge_profile(
            numero_processo,
            progress_cb=progress_cb,
        )
    except Exception as e:
        logger.error(f"[jobId={job_id}] CRITICAL TASK FAILURE: {e}", exc_info=True)
        progress_cb(100, f"Erro fatal: {str(e)}")
        raise e

    if not payload.get("sucesso"):
        progress_cb(100, "Falha na clonagem.")
        logger.warning(
            "[jobId=%s] DataJudService finished with error: %s", job_id, payload.get("msg")
        )
        return payload

    # Industrial Insights
    quality_score = payload.get("metadata", {}).get("data_quality_score", 0)
    logger.info(f"[jobId={job_id}] Data Transformation Applied. Quality Score: {quality_score:.2f}")

    progress_cb(100, "Concluído.")
    logger.info("[jobId=%s] clone_juiz_datajud_task finished (ok)", job_id)
    return payload

def check_datajud_key_health() -> Dict[str, Any]:
    """
    Weekly Maintenance Task: Checks if the DataJud API Key is up-to-date.
    Scrapes the official Wiki and rotates the key if a mismatch is found.
    """
    from backend.services.datajud_auth_service import DataJudAuthService
    
    logger.info("Starting DataJud Key Health Check...")
    try:
        new_key = DataJudAuthService.rotate_key_if_needed()
        current_key = os.getenv("DATAJUD_API_KEY")
        
        status = "rotated" if new_key != current_key else "healthy"
        return {
            "status": "success",
            "action": status,
            "current_key_preview": f"{current_key[:10]}..." if current_key else None
        }
    except Exception as e:
        logger.error(f"DataJud Key Health Check Failed: {e}")
        return {"status": "error", "message": str(e)}

def archive_old_data_task() -> dict:
    """
    Weekly/Daily Industrial Cleanup: Move old data to cold storage.
    Can be triggered by RQ-Scheduler or manual governance call.
    """
    from backend.services.archiving_service import ArchivingService
    
    logger.info("Starting scheduled Industrial Data Archiving job…")
    db = SessionLocal()
    try:
        count = ArchivingService.archive_old_audit_logs(db)
        stats = ArchivingService.get_archive_stats(db)
        
        logger.info(f"Industrial Cleanup Finished. Archived: {count} logs.")
        return {
            "sucesso": True,
            "archived_count": count,
            "storage_stats": stats
        }
    except Exception as e:
        logger.error(f"Scheduled Archiving Task Failed: {e}")
        return {"sucesso": False, "erro": str(e)}
    finally:
        db.close()
