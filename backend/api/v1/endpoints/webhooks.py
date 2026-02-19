from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.api import deps, schemas
from backend.repository.models import WebhookSubscription
from backend.core.exceptions import EntityNotFoundException

router = APIRouter()

@router.post("/register", response_model=schemas.ResponseEnvelope[schemas.WebhookSubscription])
async def register_webhook(
    sub_in: schemas.WebhookSubscriptionCreate,
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("view_reports")) # Institutional Admin Role
) -> Any:
    """
    Register a new institutional webhook subscription.
    Enables real-time interoperability with external systems.
    """
    sub = WebhookSubscription(
        url=sub_in.url,
        event_type=sub_in.event_type,
        secret=sub_in.secret,
        is_active=sub_in.is_active
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return schemas.ResponseEnvelope(data=sub)

@router.get("/", response_model=schemas.ResponseEnvelope[List[schemas.WebhookSubscription]])
async def list_webhooks(
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("view_reports"))
) -> Any:
    """List all active institutional webhook subscriptions."""
    subs = db.query(WebhookSubscription).all()
    return schemas.ResponseEnvelope(data=subs)

@router.delete("/{sub_id}", response_model=schemas.ResponseEnvelope[dict])
async def delete_webhook(
    sub_id: int,
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("view_reports"))
) -> Any:
    """Remove a webhook subscription."""
    sub = db.query(WebhookSubscription).filter(WebhookSubscription.id == sub_id).first()
    if not sub:
        raise EntityNotFoundException("WebhookSubscription", sub_id)
        
    db.delete(sub)
    db.commit()
    return schemas.ResponseEnvelope(data={"sucesso": True, "id": sub_id})

@router.post("/{sub_id}/test", response_model=schemas.ResponseEnvelope[dict])
async def test_webhook(
    sub_id: int,
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("view_reports"))
) -> Any:
    """Dispatch a test event to verify the webhook integration."""
    sub = db.query(WebhookSubscription).filter(WebhookSubscription.id == sub_id).first()
    if not sub:
        raise EntityNotFoundException("WebhookSubscription", sub_id)
        
    from backend.services.event_service import EventService
    EventService.emit_event(db, sub.event_type, {
        "test": True,
        "message": "PROLOGOS Institutional Webhook Test",
        "timestamp": str(datetime.datetime.utcnow())
    })
    
    return schemas.ResponseEnvelope(data={"sucesso": True, "message": "Evento de teste enfileirado."})
