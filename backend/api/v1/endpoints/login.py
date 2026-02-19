from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from backend.services.user_service import UserService
from backend.services.audit_service import AuditService
from backend.api import deps

router = APIRouter()

@router.post("/login/access-token")
def login_access_token(
    request: Request,
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = UserService.authenticate_user(form_data.username, form_data.password)
    if not user:
        # Audit failed attempt
        AuditService.log_action(
            db, 
            action="LOGIN_FAILED", 
            resource="auth", 
            user_ip=request.client.host,
            details={"username": form_data.username}
        )
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")
    elif user.disabled:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    
    # Audit successful login
    AuditService.log_action(
        db, 
        action="LOGIN_SUCCESS", 
        resource="auth", 
        user_ip=request.client.host,
        details={"username": user.username, "role": user.role}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.username, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
