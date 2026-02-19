from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import Any, List, Optional, Dict
from backend.api import schemas, deps
from backend.services.agenda_service import AgendaService

router = APIRouter()

@router.get("/slots", response_model=schemas.ResponseEnvelope[List[Dict[str, Any]]])
def get_available_slots(
    lawyer_id: int = Query(1),
    date: str = Query(...)
):
    """
    Get public available slots for a lawyer on a specific date.
    """
    slots = AgendaService.get_public_slots(lawyer_id, date)
    return schemas.ResponseEnvelope(data=slots)

@router.get("/types", response_model=schemas.ResponseEnvelope[Dict[str, Any]])
def get_appointment_types():
    """
    Get configured appointment types and durations.
    """
    types = AgendaService.list_types()
    return schemas.ResponseEnvelope(data=types)

@router.post("/book", response_model=schemas.ResponseEnvelope[Dict[str, Any]])
def book_appointment(
    lawyer_id: int = Body(..., embed=True),
    client_name: str = Body(..., embed=True),
    theme_key: str = Body(..., embed=True),
    date: str = Body(..., embed=True),
    time: str = Body(..., embed=True)
):
    """
    Book an appointment slot.
    """
    try:
        booking = AgendaService.book_slot(lawyer_id, client_name, theme_key, date, time)
        return schemas.ResponseEnvelope(data=booking)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
