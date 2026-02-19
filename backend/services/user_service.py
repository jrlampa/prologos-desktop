from typing import Optional
from backend.core.security import verify_password, get_password_hash
from pydantic import BaseModel

# Simple User Model for now (can be moved to schemas later)
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    role: str = "analyst" # analyst, auditor, manager, admin
    disabled: bool | None = None

# Hardcoded DB for Phase 37
# Default password is "admin"
FAKE_USERS_DB = {
    "admin": {
        "username": "admin",
        "full_name": "Administrador Enterprise",
        "email": "admin@prologos.jus.br",
        "hashed_password": get_password_hash("admin"),
        "role": "admin",
        "disabled": False,
    }
}

class UserService:
    @staticmethod
    def get_user(username: str) -> Optional[User]:
        if username in FAKE_USERS_DB:
            user_dict = FAKE_USERS_DB[username]
            return User(**user_dict)
        return None

    @staticmethod
    def authenticate_user(username: str, password: str) -> Optional[User]:
        user = UserService.get_user(username)
        if not user:
            return None
        
        # In a real DB, we would query the hashed password
        user_dict = FAKE_USERS_DB[username]
        if not verify_password(password, user_dict["hashed_password"]):
            return None
            
        return user
