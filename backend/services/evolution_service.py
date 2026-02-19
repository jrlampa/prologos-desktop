import os
import requests
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class EvolutionService:
    """
    Manages the lifecycle of EvolutionAPI instances.
    Responsible for Connection, QR Code generation, and Status checks.
    """
    
    BASE_URL = os.getenv("EVOLUTION_API_URL")
    API_KEY = os.getenv("EVOLUTION_API_KEY")
    INSTANCE = os.getenv("EVOLUTION_INSTANCE_NAME", "ProLogos_Main")

    @classmethod
    def _headers(cls):
        return {
            "apikey": cls.API_KEY,
            "Content-Type": "application/json"
        }

    @classmethod
    def create_instance(cls) -> Dict[str, Any]:
        """
        Creates the instance if it doesn't exist.
        Endpoint: /instance/create
        """
        if not cls.BASE_URL:
            return {"error": "Evolution API not configured"}

        url = f"{cls.BASE_URL}/instance/create"
        payload = {
            "instanceName": cls.INSTANCE,
            "token": os.getenv("EVOLUTION_INSTANCE_TOKEN", "secret_token_123"),
            "qrcode": True
        }
        
        try:
            resp = requests.post(url, json=payload, headers=cls._headers(), timeout=10)
            if resp.status_code == 403: # Already exists
                 return {"status": "exists", "instance": cls.INSTANCE}
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to create instance: {e}")
            return {"error": str(e)}

    @classmethod
    def connect_instance(cls) -> Dict[str, Any]:
        """
        Gets the QR Code for scanning.
        Endpoint: /instance/connect/{instance}
        """
        if not cls.BASE_URL:
            return {"base64": None, "error": "Not Configured"}

        url = f"{cls.BASE_URL}/instance/connect/{cls.INSTANCE}"
        try:
            resp = requests.get(url, headers=cls._headers(), timeout=10)
            resp.raise_for_status()
            data = resp.json()
            # Evolution v2 usually returns base64 or link
            return data # Expecting { "base64": "...", "code": "..." }
        except Exception as e:
             logger.error(f"Failed to get QR: {e}")
             return {"error": str(e)}

    @classmethod
    def get_connection_state(cls) -> str:
        """
        Checks if connected.
        Endpoint: /instance/connectionState/{instance}
        """
        if not cls.BASE_URL:
            return "disconnected"

        url = f"{cls.BASE_URL}/instance/connectionState/{cls.INSTANCE}"
        try:
            resp = requests.get(url, headers=cls._headers(), timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("instance", {}).get("state", "disconnected")
            return "disconnected"
        except Exception:
            return "disconnected"
