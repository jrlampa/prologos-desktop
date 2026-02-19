import hmac
import hashlib
import json
import requests
from sqlalchemy.orm import Session
from backend.repository.models import WebhookSubscription
from backend.core.queue import get_redis
from backend.core.logger import logger

class EventService:
    @staticmethod
    def emit_event(db: Session, event_type: str, payload: dict):
        """
        Institutional Event Mesh: Enqueue an event for all active subscriptions.
        """
        try:
            subscriptions = db.query(WebhookSubscription).filter(
                WebhookSubscription.event_type == event_type,
                WebhookSubscription.is_active == True
            ).all()
            
            if not subscriptions:
                return

            redis = get_redis()
            for sub in subscriptions:
                event_job = {
                    "url": sub.url,
                    "event_type": event_type,
                    "payload": payload,
                    "secret": sub.secret,
                    "subscription_id": sub.id
                }
                # Enqueue for worker processing to avoid blocking API
                redis.lpush("prologos:events", json.dumps(event_job))
                
            logger.info(f"EventMesh: {len(subscriptions)} jobs enqueued for event '{event_type}'")
            
        except Exception as e:
            logger.error(f"EventMesh Error [Emit {event_type}]: {e}")

    @staticmethod
    def dispatch_webhook(event_job: dict):
        """
        Worker Side: Execute the HTTP POST request with HMAC signature.
        """
        url = event_job["url"]
        payload_str = json.dumps(event_job["payload"])
        secret = event_job["secret"]
        
        headers = {
            "Content-Type": "application/json",
            "X-Prologos-Event": event_job["event_type"],
            "X-Prologos-Delivery": str(datetime.datetime.utcnow().timestamp())
        }
        
        # Add HMAC signature for security
        if secret:
            signature = hmac.new(
                secret.encode(),
                payload_str.encode(),
                hashlib.sha256
            ).hexdigest()
            headers["X-Prologos-Signature"] = f"sha256={signature}"
            
        try:
            response = requests.post(url, data=payload_str, headers=headers, timeout=10)
            response.raise_for_status()
            logger.info(f"Webhook Delivered: {url} (Event: {event_job['event_type']})")
        except Exception as e:
            logger.warning(f"Webhook Delivery Failed: {url} - {e}")
            # In a full PRO system, we would implement a retry strategy here
