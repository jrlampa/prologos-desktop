from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, Generic, TypeVar, List, Any, Dict

T = TypeVar("T")

class ResponseEnvelope(BaseModel, Generic[T]):
    ok: bool = True
    data: Optional[T] = None
    detail: Optional[str] = None
    metadata: Dict[str, Any] = {}

class PaginatedData(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


# Schema base para Juiz
class JuizBase(BaseModel):
    nome: str
    vara: str


class Juiz(JuizBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Schema base para Decisao
class DecisaoBase(BaseModel):
    numero_processo: str
    texto_decisao: Optional[str] = None
    resultado: Optional[str] = None
    tema: Optional[str] = None
    data_decisao: Optional[date] = None


class Decisao(DecisaoBase):
    id: int
    juiz_id: int

    model_config = ConfigDict(from_attributes=True)

class HealthInfo(BaseModel):
    status: str
    version: str
    service: str
