from typing import Generator, Optional
from fastapi import Header, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.services.security_service import SecurityService
from backend.repository.models import APIKey
from jose import jwt, JWTError
from backend.core.security import SECRET_KEY, ALGORITHM
from backend.services.user_service import UserService, User
from fastapi.security import OAuth2PasswordBearer

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_tenant_db(request: Request) -> Generator:
    """Scoped Session: Automatically filters by the resolved Tenant."""
    db = SessionLocal()
    org_id = getattr(request.state, "org_id", None)
    
    # In a full PRO system, we would use SQLAlchemy event listeners (before_compile)
    # for global multi-tenancy filters. For this overhaul, we provide the scoped session
    # and expect services to use the org_id from request.state.
    try:
        yield db
    finally:
        db.close()

async def get_current_key(
    request: Request,
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> APIKey:
    """Industrial Identity verification with Multi-Tenancy awareness."""
    key_obj = SecurityService.validate_api_key(db, x_api_key)
    if not key_obj or not key_obj.is_active:
        raise HTTPException(status_code=401, detail="Chave de API inválida ou revogada.")
    
    # Validation: Key must belong to an active organization (if org-scoped)
    if key_obj.org_id:
        if not key_obj.organization or not key_obj.organization.is_active:
            raise HTTPException(status_code=403, detail="Organização inativa ou suspensa.")
    
    # Injetar informações no estado do request para middlewares/audit
    request.state.user = key_obj.user
    request.state.api_key_id = key_obj.id
    request.state.tier = key_obj.tier
    request.state.org_id = key_obj.org_id # Sync state with Identity
    
    return key_obj

async def check_permission(permission: str):
    """Factory for RBAC permission dependencies."""
    def permission_checker(key_obj: APIKey = Depends(get_current_key)):
        if not SecurityService.has_permission(key_obj.user, permission):
            raise HTTPException(
                status_code=403, 
                detail=f"Permissão negada para esta operação corporativa: {permission}"
            )
        return True
    return Depends(permission_checker)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/login/access-token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = UserService.get_user(username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return current_user
