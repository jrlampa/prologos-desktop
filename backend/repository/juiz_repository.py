from sqlalchemy.orm import Session
from backend.repository.base import CRUDBase
from backend.repository.models import Juiz

class JuizRepository(CRUDBase[Juiz]):
    def __init__(self, db: Session):
        super().__init__(Juiz, db)

    def get_by_name(self, name: str) -> Optional[Juiz]:
        return self.db.query(self.model).filter(self.model.nome == name).first()
