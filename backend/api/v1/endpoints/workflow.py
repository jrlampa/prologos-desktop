from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import Any, List, Optional, Dict
from backend.api import schemas, deps
from backend.services.workflow_service import WorkflowService

router = APIRouter()

@router.post("/cases", response_model=schemas.ResponseEnvelope[dict])
def create_case(
    title: str = Body(..., embed=True),
    description: str = Body(..., embed=True),
    responsible_id: int = Body(..., embed=True),
    value: float = Body(..., embed=True),
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Create a new legal case (TRIAGE stage).
    """
    case = WorkflowService.create_case(title, description, responsible_id, value)
    return schemas.ResponseEnvelope(data=case)

@router.get("/cases", response_model=schemas.ResponseEnvelope[List[dict]])
def list_cases(
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    List all legal cases.
    """
    cases = WorkflowService.list_cases()
    return schemas.ResponseEnvelope(data=cases)

@router.post("/cases/{case_id}/move", response_model=schemas.ResponseEnvelope[dict])
def move_case(
    case_id: int,
    target_stage: str = Body(..., embed=True),
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Move a case to a new stage.
    """
    user_id = getattr(current_user, "id", 1)
    try:
        case = WorkflowService.move_card(case_id, target_stage, user_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        return schemas.ResponseEnvelope(data=case)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
