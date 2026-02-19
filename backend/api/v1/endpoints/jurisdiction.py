from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import Any, List, Optional, Dict
from backend.api import schemas, deps
from backend.services.crawler_service import JurisdictionService

router = APIRouter()

@router.get("/compare", response_model=schemas.ResponseEnvelope[Dict[str, Any]])
def compare_jurisdictions(
    subject: str = Query(..., description="Legal subject to compare (e.g. Dano Moral)")
):
    """
    Compare success rates and tendencies between different Comarcas.
    """
    data = JurisdictionService.compare_jurisdictions(subject)
    return schemas.ResponseEnvelope(data=data)

@router.post("/predict", response_model=schemas.ResponseEnvelope[Dict[str, Any]])
def predict_petition_outcome(
    draft_text: str = Body(..., embed=True),
    comarca: str = Body(..., embed=True)
):
    """
    Analyze a draft petition against a specific Comarca's profile.
    Returns success probability and estimated duration.
    """
    data = JurisdictionService.predict_petition_outcome(draft_text, comarca)
    return schemas.ResponseEnvelope(data=data)
