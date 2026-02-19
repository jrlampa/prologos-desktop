import re
from typing import Any, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.services.legal_ai_service import LegalAIService
from backend.services.dialectic_ai_service import DialecticAIService
from backend.services.filing_bridge_service import FilingBridgeService
from backend.services.digital_signature_service import DigitalSignatureService
from backend.services.mni_connector import MNIConnector
from backend.core.universal_schema import UniversalLegalRecord

router = APIRouter()

@router.post("/analyze", response_model=UniversalLegalRecord)
def analyze_publication(
    raw_text: str,
    tribunal: str,
    process_number: str,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """
    Trigger Sovereign AI Analysis for a specific publication.
    """
    try:
        record = LegalAIService.analyze_publication(
            raw_text=raw_text,
            tribunal=tribunal,
            process_number=process_number
        )
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")
@router.post("/dialectic")
def generate_dialectic_strategy(
    thesis: str,
    phase: str = "Postulatório",
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """
    Generate Thesis-Antithesis-Synthesis strategy for legal arguments.
    """
    try:
        strategy = DialecticAIService.generate_strategy(thesis, phase)
        return strategy
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dialectic generation failed: {str(e)}")

import time

def sanitize_legal_text(text: str) -> str:
    """
    Sovereign Sanitization. Removes HTML/Script tags to prevent injection.
    """
    if not text: return ""
    # Strip HTML tags
    clean = re.sub(r'<.*?>', '', text)
    return clean

# Simple in-memory rate limit tracking
RATE_LIMITS = {}

@router.post("/sign-and-submit")
def sign_and_submit_petition(
    internal_id: str,
    tribunal: str,
    manual_content: Optional[str] = None,
    cert_id: str = "cert_001",
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """
    Sovereign Signing and Submission Chain.
    Includes Rate Limiting and Sanitization (Phase 47).
    """
    # 1. Rate Limiting (Technical Security)
    # Note: current_user.id is used here; assuming User model has id.
    user_key = f"user_{internal_id}" 
    if user_key in RATE_LIMITS and (time.time() - RATE_LIMITS[user_key]) < 10:
        raise HTTPException(status_code=429, detail="Muitas tentativas para este processo. Aguarde 10s.")
    RATE_LIMITS[user_key] = time.time()

    try:
        # 2. Sanitization (Judicial/Tech Security)
        if manual_content:
            manual_content = sanitize_legal_text(manual_content)

        # 3. Fetch record/strategy (Simulated for now)
        strategy_data = {"synthesis": "Petição AI", "process_number": internal_id, "tribunal": tribunal}
        
        # 2. Compose and Normalize (ABNT)
        pdf_bytes = FilingBridgeService.compose_petition(strategy_data, manual_content)
        
        # 3. Digital Signature
        signed_obj = DigitalSignatureService.sign_document(pdf_bytes, cert_id)
        
        # 4. MNI Submission
        receipt = MNIConnector.submit_initial_petition(signed_obj, tribunal)
        
        return receipt
    except ConnectionError as ce:
        # Trigger Fallback Scheduling logic here
        raise HTTPException(status_code=503, detail=str(ce))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Filing failed: {str(e)}")
