from typing import Any
from fastapi import APIRouter, Depends
from backend.api import deps
from backend.services.official_source_connector import OfficialSourceConnector
from backend.services.user_service import User

router = APIRouter()

@router.get("/watchers", response_model=dict)
def get_litigation_watchers(
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Returns active litigation monitoring 'watchers' (Sentinelas).
    """
    # In a real enterprise DB, this would query the 'Watchers' table
    return {
        "status": "success",
        "watchers": [
            {"id": 1, "keyword": "IM3 Brasil", "tags": ["Corporate", "Strategic"], "last_hit": "2026-02-15"},
            {"id": 2, "keyword": "Prólogos Intelligence", "tags": ["IP", "Trademark"], "last_hit": None},
        ],
        "system_health": "PRO_ACTIVE"
    }

@router.post("/query-publications")
async def query_publications(
    query: str,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Executes a real-time query across Brazilian Official Journals (Diários de Justiça).
    """
    # Delegating to Official Connector Hub
    results = OfficialSourceConnector.search_publications(query)
    return results
