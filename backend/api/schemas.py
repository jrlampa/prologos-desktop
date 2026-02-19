from typing import List, Dict, Any, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict, Field
from datetime import date

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
    nome: str = Field(..., min_length=3, max_length=150, description="Nome oficial do magistrado")
    vara: Optional[str] = Field(None, max_length=200)

class JuizCreate(JuizBase):
    tribunal_id: int = Field(..., gt=0)

class Juiz(JuizBase):
    id: int
    tribunal_id: int
    model_config = ConfigDict(from_attributes=True)

class HealthInfo(BaseModel):
    status: str
    version: str
    service: str

# --- BI & Reporting Models (Phase 12) ---
class KPIMetrics(BaseModel):
    total_requests_24h: int
    top_endpoint: str
    active_consumers: int
    data_quality_avg: float
    system_resilience_score: float

class InstitutionalReport(BaseModel):
    generated_at: str
    period: str
    kpis: KPIMetrics
    industrial_summary: str
    recommendations: List[str]

# --- Webhook & Event Mesh Models (Phase 15) ---
class WebhookSubscriptionBase(BaseModel):
    url: str = Field(..., description="Target URL for institutional events")
    event_type: str = Field(..., description="Type of event to subscribe to")
    is_active: bool = True

class WebhookSubscriptionCreate(WebhookSubscriptionBase):
    secret: Optional[str] = Field(None, description="Secret for HMAC payload signing")

class WebhookSubscription(WebhookSubscriptionBase):
    id: int
    created_at: Any
    model_config = ConfigDict(from_attributes=True)
