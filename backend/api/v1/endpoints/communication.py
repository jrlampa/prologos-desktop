from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Any, List, Optional
from backend.api import schemas, deps
from backend.services.communication_service import CommunicationService
from pydantic import BaseModel

router = APIRouter()

class NotificationRequest(BaseModel):
    client_phone: str
    client_email: Optional[str] = None
    message: str
    channels: List[str] = ["whatsapp"]

@router.post("/notify-client", response_model=schemas.ResponseEnvelope[dict])
def notify_client(
    req: NotificationRequest,
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Sends an omnichannel notification to a client.
    """
    context = {
        "client_phone": req.client_phone,
        "client_email": req.client_email
    }
    
    result = CommunicationService.notify_client_update(
        context, 
        req.message, 
        req.channels
    )
    
    return schemas.ResponseEnvelope(data=result)
