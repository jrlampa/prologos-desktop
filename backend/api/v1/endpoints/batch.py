from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import Any, List, Optional, Dict
from backend.api import schemas, deps
from backend.services.batch_service import BatchService

router = APIRouter()

@router.post("/move", response_model=schemas.ResponseEnvelope[dict])
def bulk_move(
    case_ids: List[int] = Body(..., embed=True),
    target_stage: str = Body(..., embed=True),
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Execute bulk move operation for multiple cases.
    """
    user_id = getattr(current_user, "id", 1)
    result = BatchService.bulk_move(case_ids, target_stage, user_id)
    return schemas.ResponseEnvelope(data=result)

@router.post("/archive", response_model=schemas.ResponseEnvelope[dict])
def bulk_archive(
    case_ids: List[int] = Body(..., embed=True),
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Execute bulk archive for multiple cases.
    """
    user_id = getattr(current_user, "id", 1)
    result = BatchService.bulk_archive(case_ids, user_id)
    return schemas.ResponseEnvelope(data=result)
