from typing import List, Dict, Any, Optional
from backend.core.logger import logger
from backend.services.workflow_service import WorkflowService
from backend.services.notification_service import NotificationService

class BatchService:
    """
    Industrial Batch Processing Engine.
    Handles high-volume atomic operations for mass litigation.
    """

    @staticmethod
    def bulk_move(case_ids: List[int], target_stage: str, user_id: int) -> Dict[str, Any]:
        """
        Executes a bulk stage transition.
        Failures in individual items do NOT rollback the entire batch (Partial Success Model),
        but are reported in the final result for manual intervention.
        """
        logger.info(f"BATCH: Moving {len(case_ids)} cases to {target_stage}...")
        
        results = {
            "success": [],
            "failed": []
        }

        for case_id in case_ids:
            try:
                # Reusing the atomic logic from WorkflowService
                updated_case = WorkflowService.move_card(case_id, target_stage, user_id)
                if updated_case:
                    results["success"].append(case_id)
                else:
                    results["failed"].append({"id": case_id, "reason": "Case not found"})
            except Exception as e:
                logger.error(f"BATCH LOAD ERROR [Case {case_id}]: {e}")
                results["failed"].append({"id": case_id, "reason": str(e)})

        # Notification Summary
        if results["success"]:
            NotificationService.emit_notification(
                user_id,
                "Processamento em Lote Concluído",
                f"{len(results['success'])} casos movidos para {target_stage}. {len(results['failed'])} falhas.",
                "success" if not results["failed"] else "warning"
            )

        return {
            "total_requested": len(case_ids),
            "success_count": len(results["success"]),
            "failed_count": len(results["failed"]),
            "details": results
        }

    @staticmethod
    def bulk_archive(case_ids: List[int], user_id: int) -> Dict[str, Any]:
        """
        Bulk archive operations (Simulated).
        """
        logger.info(f"BATCH: Archiving {len(case_ids)} cases...")
        # Mock implementation similar to move
        return {
            "total_requested": len(case_ids),
            "success_count": len(case_ids),
            "failed_count": 0,
            "details": {"success": case_ids, "failed": []}
        }
