from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import Any, List, Optional, Dict
from backend.api import schemas, deps
from backend.services.crawler_service import CrawlerService

router = APIRouter()

@router.post("/clone/{cnj}", response_model=schemas.ResponseEnvelope[Dict[str, Any]])
async def clone_case(cnj: str):
    """
    Trigger a deep clone of a case from DataJud/Comarca.
    Returns the "perfect mirror" of the procedural state.
    """
    try:
        data = await CrawlerService.clone_case(cnj)
        return schemas.ResponseEnvelope(data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/case/{cnj}/analysis", response_model=schemas.ResponseEnvelope[Dict[str, Any]])
def get_case_analysis(cnj: str):
    """
    Get AI evaluation of the case status based on the clone.
    """
    case = CrawlerService.get_cloned_case(cnj)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found. Please clone first.")
    
    return schemas.ResponseEnvelope(data={
        "status_code": case["status"],
        "prediction": case["prediction"],
        "last_update": case["cloned_at"]
    })

@router.get("/official/{cnj}", response_model=schemas.ResponseEnvelope[Dict[str, Any]])
def get_official_data(cnj: str):
    """
    Retrieves validated data from official sources (Tribunals/DataJud).
    """
    from backend.services.official_source_connector import OfficialSourceConnector
    data = OfficialSourceConnector.get_process_data(cnj)
    return schemas.ResponseEnvelope(data=data)
