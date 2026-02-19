from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from backend.services.gov_br_service import GovBrService
from backend.api import deps
from backend.services.user_service import User

router = APIRouter()

@router.get("/cnpj/{cnpj}")
def consultar_cnpj(
    cnpj: str,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Search CNPJ data via Gov.br/BrasilAPI.
    Requires Authentication.
    """
    if not cnpj:
        raise HTTPException(status_code=400, detail="CNPJ é obrigatório")

    result = GovBrService.consultar_cnpj(cnpj)
    
    if result["status"] == "error":
        # 404 for not found, 500 for other errors
        if "não encontrado" in result["message"].lower():
             raise HTTPException(status_code=404, detail=result["message"])
        raise HTTPException(status_code=502, detail=result["message"])
        
    return result
