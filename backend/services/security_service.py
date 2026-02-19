from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from backend.repository.models import APIKey, User
from backend.core.logger import logger
from backend.core.exceptions import PrologosException

class SecurityService:
    # --- Institutional Role Matrix ---
    ROLE_PERMISSIONS = {
        "admin": ["*"], # Full access
        "manager": ["list_magistrates", "generate_dossier", "view_reports", "analyze_peticao"],
        "auditor": ["list_magistrates", "view_reports", "view_audit_logs"],
        "analyst": ["list_magistrates", "analyze_peticao"]
    }

    @staticmethod
    def validate_api_key(db: Session, api_key: str) -> Optional[APIKey]:
        """Verify API key existence and retrieve associated metadata (User/Tier)."""
        try:
            return db.query(APIKey).filter(APIKey.key == api_key).first()
        except Exception as e:
            logger.error(f"Security Key Validation Error: {e}")
            return None

    @staticmethod
    def has_permission(user: User, required_permission: str) -> bool:
        """Granular RBAC check against the institutional role matrix."""
        if not user or not user.is_active:
            return False
            
        user_permissions = SecurityService.ROLE_PERMISSIONS.get(user.role, [])
        
        # Admin wildcard
        if "*" in user_permissions:
            return True
            
        return required_permission in user_permissions

    @staticmethod
    def get_tier_limit(tier: str) -> int:
        """Standardized rate limits per Industrial Tier."""
        tier_map = {
            "industrial": 100,
            "priority": 50,
            "standard": 20
        }
        return tier_map.get(tier, 10)

    @staticmethod
    def revoke_api_key(db: Session, key_id: int, reason: str = "Automated Lockdown"):
        """
        Immediately disable an API key due to security breaches or anomalies.
        """
        try:
            key = db.query(APIKey).filter(APIKey.id == key_id).first()
            if key:
                key.is_active = False
                db.commit()
                logger.critical(f"SECURITY_LOCKDOWN: Key {key_id} revoked. Reason: {reason}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error revoking API key: {e}")
            db.rollback()
            return False
