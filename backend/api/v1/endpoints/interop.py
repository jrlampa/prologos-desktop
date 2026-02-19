from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from backend.api import deps
from backend.core.universal_schema import UniversalLegalRecord
from backend.services.official_source_connector import OfficialSourceConnector

router = APIRouter()

@router.get("/consume", response_model=List[UniversalLegalRecord])
def consume_normalized_data(
    query: str = "Prologos",
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_user)
) -> Any:
    """
    Sovereign Global Consumption Endpoint.
    Returns normalized, inter-tribunal data for integration.
    """
    try:
        # Fetch data from our normalized source
        raw_data = OfficialSourceConnector.search_publications(query)
        hits = raw_data.get("hits", [])
        
        # In a real scenario, this would be enriched or fetched from DB
        # For now, we return the search hits complying with Universal Schema
        return hits
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interoperability fetch failed: {str(e)}")
