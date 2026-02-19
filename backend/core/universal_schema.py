from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.core.procedural_rites import RiteType, ProceduralPhase

class Entity(BaseModel):
    name: str
    role: str  # Lawyer, Plaintiff, Defendant, Judge
    id_number: Optional[str] = None  # OAB, CPF, CNPJ

class Deadline(BaseModel):
    description: str
    date: datetime
    criticality: str = "MEDIUM" # LOW, MEDIUM, HIGH, CRITICAL

class StatutoryAnchor(BaseModel):
    """Concrete model for legal basis citations."""
    article: str
    law: str
    description: Optional[str] = None
    link: Optional[str] = None

class UniversalLegalRecord(BaseModel):
    """
    Sovereign Standard for Legal Data Consumption.
    Designed for cross-tribunal interoperability.
    """
    id: str = Field(..., description="Unique industrial identifier")
    tribunal: str = Field(..., description="Source tribunal (e.g., TJSP, STJ)")
    process_number: str
    publication_date: datetime
    content: str
    entities: List[Entity] = []
    deadlines: List[Deadline] = []
    
    # AI Metadata
    ai_summary: Optional[str] = None
    ai_risk_score: float = 0.0
    ai_tags: List[str] = []
    
    # Procedural Markers (Phase 42)
    current_rite: Optional[RiteType] = None
    procedural_phase: Optional[ProceduralPhase] = None
    next_ritual_step: Optional[str] = None
    
    # Argumentative Mesh (Phase 43)
    legal_basis: List[StatutoryAnchor] = []
    
    # Dialectic Strategy (Phase 44)
    strategy_board: Optional[Dict[str, Any]] = None # {"thesis": "", "antithesis": "", "synthesis": ""}
    
    # Raw Metadata for traceability
    raw_source: str
    captured_at: datetime = Field(default_factory=datetime.now)
    org_id: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "UNIV-2025-001",
                "tribunal": "TJSP",
                "process_number": "1029384-55.2025.8.26.0100",
                "publication_date": "2025-02-18T10:00:00",
                "content": "Vara 10 Cível. Intime-se as partes...",
                "entities": [{"name": "João da Silva", "role": "Plaintiff"}],
                "ai_risk_score": 0.85
            }
        }
