from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from backend.repository.models import Base

T = TypeVar("T", bound=Base)

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get(self, id: any) -> Optional[T]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj_in: T) -> T:
        self.db.add(obj_in)
        self.db.commit()
        self.db.refresh(obj_in)
        return obj_in

    def remove(self, id: any) -> Optional[T]:
        obj = self.db.query(self.model).get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj

    def get_paginated(self, page: int = 1, size: int = 20) -> tuple[List[T], int]:
        total = self.db.query(self.model).count()
        pages = (total + size - 1) // size
        items = self.db.query(self.model).offset((page - 1) * size).limit(size).all()
        return items, total
