from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.core.logger import logger

class NotificationService:
    """
    Centralized NotificationHub for the Legal Ecosystem.
    Manages alerts for deadlines, jurisprudence updates, and system events.
    """
    
    _mock_notifications = []

    @classmethod
    def emit_notification(cls, user_id: int, title: str, message: str, type: str = "info", priority: str = "normal"):
        """
        Emits a notification to a specific user.
        Types: info, warning, error, success, deadline
        """
        notification = {
            "id": len(cls._mock_notifications) + 1,
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": type,
            "priority": priority,
            "read": False,
            "timestamp": datetime.now().isoformat()
        }
        cls._mock_notifications.insert(0, notification)
        logger.info(f"Notification Emitted: [{type.upper()}] {title} -> User {user_id}")
        # In a real scenario, this would push to a WebSocket or Redis Pub/Sub
        return notification

    @classmethod
    def get_user_notifications(cls, user_id: int, unread_only: bool = False) -> List[Dict[str, Any]]:
        """
        Retrieves notifications for a user.
        """
        return [
            n for n in cls._mock_notifications 
            if n["user_id"] == user_id and (not unread_only or not n["read"])
        ]

    @classmethod
    def mark_as_read(cls, notification_id: int, user_id: int) -> bool:
        """
        Marks a notification as read.
        """
        for n in cls._mock_notifications:
            if n["id"] == notification_id and n["user_id"] == user_id:
                n["read"] = True
                return True
        return False

    @staticmethod
    def broadcast_system_alert(message: str):
        """
        Broadcasts a system-wide alert (e.g., maintenance, critical updates).
        """
        logger.warning(f"SYSTEM BROADCAST: {message}")
        # Mock implementation: adds to a global queue or emits to all active sessions
