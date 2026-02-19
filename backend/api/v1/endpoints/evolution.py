from fastapi import APIRouter, Depends
from typing import Any
from backend.api import schemas, deps
from backend.services.evolution_service import EvolutionService

router = APIRouter()

@router.post("/instance", response_model=schemas.ResponseEnvelope[dict])
def create_instance(
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Creates/Initializes the Evolution API Instance.
    """
    result = EvolutionService.create_instance()
    return schemas.ResponseEnvelope(data=result)

@router.get("/connect", response_model=schemas.ResponseEnvelope[dict])
def connect_instance(
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Retrieves the QR Code (base64) for scanning.
    """
    result = EvolutionService.connect_instance()
    return schemas.ResponseEnvelope(data=result)

@router.get("/status", response_model=schemas.ResponseEnvelope[dict])
def get_status(
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Checks connection status.
    """
    status = EvolutionService.get_connection_state()
    return schemas.ResponseEnvelope(data={"status": status})
