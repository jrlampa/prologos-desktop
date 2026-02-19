from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Any, List, Optional
from backend.api import schemas, deps
from backend.services.notification_service import NotificationService

router = APIRouter()

@router.get("/", response_model=schemas.ResponseEnvelope[List[dict]])
def get_notifications(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Get user notifications.
    """
    # Assuming user_id is 1 for now if mock user
    user_id = getattr(current_user, "id", 1)
    notifications = NotificationService.get_user_notifications(user_id, unread_only)
    return schemas.ResponseEnvelope(data=notifications)

@router.post("/{notification_id}/read", response_model=schemas.ResponseEnvelope[bool])
def mark_notification_read(
    notification_id: int,
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    Mark a notification as read.
    """
    user_id = getattr(current_user, "id", 1)
    success = NotificationService.mark_as_read(notification_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return schemas.ResponseEnvelope(data=True)

@router.post("/test-emit", response_model=schemas.ResponseEnvelope[dict])
def test_emit_notification(
    title: str,
    message: str,
    type: str = "info",
    current_user: Any = Depends(deps.get_current_active_user)
):
    """
    [DEV] Test emit notification to self.
    """
    user_id = getattr(current_user, "id", 1)
    notification = NotificationService.emit_notification(user_id, title, message, type)
    return schemas.ResponseEnvelope(data=notification)
