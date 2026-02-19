from fastapi import APIRouter, Depends, Query, Body, Request
from typing import Any
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.api import schemas, deps
from backend.services.finance_service import FinanceService
from backend.services.audit_service import AuditService

router = APIRouter()

class PixRequest(BaseModel):
    pix_key: str
    merchant_name: str
    merchant_city: str
    amount: str = None  # Optional
    txtid: str = "***"

@router.post("/pix/charge", response_model=schemas.ResponseEnvelope[dict])
def generate_pix(
    request: Request,
    req: PixRequest, 
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Generates a Pix BR Code (Copy & Paste).
    """
    result = FinanceService.generate_pix_payload(
        pix_key=req.pix_key,
        merchant_name=req.merchant_name,
        merchant_city=req.merchant_city,
        amount=req.amount,
        txtid=req.txtid
    )
    
    # Industrial Audit
    AuditService.log_action(
        db,
        action="PIX_GENERATE",
        resource="finance",
        user_ip=request.client.host,
        details={
            "user": current_user.username,
            "amount": req.amount,
            "pix_key": "***" # Privacy first
        },
        org_id=getattr(current_user, "org_id", None)
    )
    
    return schemas.ResponseEnvelope(data=result)
