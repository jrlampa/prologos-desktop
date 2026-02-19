import os
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

class CommunicationService:
    """
    Omnichannel Communication Service (WhatsApp & Email).
    Manages A2P (Application-to-Person) messaging for client updates.
    """

    @staticmethod
    def send_whatsapp(phone: str, message: str) -> Dict[str, Any]:
        """
        Sends a WhatsApp message via Provider (Mock/Twilio/WPPConnect).
        """
        # Validate formatting (+55...)
        if not phone.startswith("+"):
            phone = f"+55{phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')}"
            
        logger.info(f"Sending WhatsApp to {phone}: {message}")
        
        # 1. EVOLUTION API INTEGRATION (Self-Hosted Sovereignty)
        evolution_url = os.getenv("EVOLUTION_API_URL")
        evolution_key = os.getenv("EVOLUTION_API_KEY")
        evolution_instance = os.getenv("EVOLUTION_INSTANCE_NAME", "ProLogos_Main")
        
        if evolution_url and evolution_key:
            try:
                import requests
                # Standard Evolution API v2 Endpoint: /message/sendText
                url = f"{evolution_url}/message/sendText/{evolution_instance}"
                headers = {
                    "apikey": evolution_key,
                    "Content-Type": "application/json"
                }
                payload = {
                    "number": phone.replace("+", ""), # Evolution usually expects number without + or with, depending on verification. E.164 without + is safest.
                    "options": {
                        "delay": 1200,
                        "presence": "composing",
                        "linkPreview": True
                    },
                    "textMessage": {
                        "text": message
                    }
                }
                
                resp = requests.post(url, json=payload, headers=headers, timeout=10)
                resp.raise_for_status()
                return {"status": "sent", "provider": "evolution_api", "details": resp.json()}
            except Exception as e:
                logger.error(f"EvolutionAPI Failed: {e}")
                return {"status": "error", "provider": "evolution_api", "error": str(e)}

        # 2. Mock Fallback
        return {"status": "simulated", "provider": "mock_provider", "timestamp": "now"}

    @staticmethod
    def send_email(to: str, subject: str, body: str) -> Dict[str, Any]:
        """
        Sends an transactional email.
        """
        logger.info(f"Sending Email to {to} | Subject: {subject}")
        # Placeholder for SMTP
        return {"status": "queued", "recipient": to}

    @staticmethod
    def notify_client_update(case_context: Dict[str, Any], message_template: str, channels: List[str] = ["whatsapp"]) -> Dict[str, Any]:
        """
        High-level method to notify client about a case update.
        """
        client_phone = case_context.get("client_phone")
        client_email = case_context.get("client_email")
        results = {}
        
        if "whatsapp" in channels and client_phone:
            results["whatsapp"] = CommunicationService.send_whatsapp(client_phone, message_template)
            
        if "email" in channels and client_email:
            results["email"] = CommunicationService.send_email(client_email, "Atualização Processual", message_template)
            
        return results
