from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.core.logger import logger
from backend.services.notification_service import NotificationService

class WorkflowService:
    """
    Legal Workflow Engine (Kanban State Machine).
    Manages the lifecycle of legal cases from intake to protocol.
    STAGES: TRIAGE -> DRAFTING -> REVIEW -> PROTOCOL -> DONE
    """
    
    # Mock Database
    _cases = []
    
    STAGES = ["TRIAGE", "DRAFTING", "REVIEW", "PROTOCOL", "DONE"]

    @classmethod
    def create_case(cls, title: str, description: str, responsible_id: int, value: float) -> Dict[str, Any]:
        """
        Creates a new legal case in the TRIAGE stage.
        """
        case_id = len(cls._cases) + 1
        case = {
            "id": case_id,
            "title": title,
            "description": description,
            "stage": "TRIAGE",
            "responsible_id": responsible_id,
            "value": value,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "history": [f"[{datetime.now().strftime('%d/%m %H:%M')}] Caso criado em TRIAGEM"]
        }
        cls._cases.append(case)
        logger.info(f"Workflow: New Case #{case_id} created.")
        
        # Notify responsible
        NotificationService.emit_notification(
            responsible_id, 
            "Novo Caso Atribuído", 
            f"Você é o responsável pelo caso '{title}'.", 
            "info"
        )
        return case

    @classmethod
    def move_card(cls, case_id: int, target_stage: str, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Transitions a case card to a new stage.
        """
        if target_stage not in cls.STAGES:
            raise ValueError(f"Invalid stage: {target_stage}")

        case = next((c for c in cls._cases if c["id"] == case_id), None)
        if not case:
            return None

        old_stage = case["stage"]
        case["stage"] = target_stage
        case["updated_at"] = datetime.now().isoformat()
        
        # Audit Log
        history_entry = f"[{datetime.now().strftime('%d/%m %H:%M')}] Movido de {old_stage} para {target_stage} por Usuário {user_id}"
        case["history"].append(history_entry)
        
        logger.info(f"Workflow: Case #{case_id} moved {old_stage} -> {target_stage}")

        # Automations / Notifications
        if target_stage == "REVIEW":
            NotificationService.emit_notification(
                case["responsible_id"], 
                "Revisão Necessária", 
                f"O caso '{case['title']}' está pronto para revisão de sócio.", 
                "warning"
            )
        elif target_stage == "DONE":
            NotificationService.emit_notification(
                case["responsible_id"], 
                "Caso Concluído", 
                f"O caso '{case['title']}' foi finalizado com sucesso.", 
                "success"
            )

        return case

    @classmethod
    def list_cases(cls) -> List[Dict[str, Any]]:
        """
        Returns all active cases.
        """
        return cls._cases
