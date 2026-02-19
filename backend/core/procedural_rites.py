from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class RiteType(str, Enum):
    ORDINARIO = "Comum (Ordinário)"
    SUMARISSIMO = "Sumaríssimo (JEC)"
    EXECUCAO = "Execução de Título"
    ESPECIAL = "Procedimento Especial"
    RECURSAL = "Fase Recursal"

class ProceduralPhase(str, Enum):
    POSTULATORIO = "Postulatório" # Petição Inicial, Citação, Contestação
    SANEAMENTO = "Saneamento" # Organização do processo, Provas
    INSTRUTORIO = "Instrução" # Audiência, Perícia
    DECISORIO = "Decisório" # Sentença
    RECURSAL = "Recursal" # Apelação, Agravos
    EXECUCAO = "Cumprimento/Execução" # Penhora, Pagamento

class RiteStep(BaseModel):
    name: str
    description: str
    order: int
    estimated_days: int

class ProceduralRitual(BaseModel):
    """
    Sovereign procedural ontology for Brazilian Law (CPC/2015).
    """
    rite_type: RiteType
    current_phase: ProceduralPhase
    history: List[ProceduralPhase] = []
    next_recommended_steps: List[str] = []
    
    @classmethod
    def get_standard_map(cls, rite: RiteType) -> List[ProceduralPhase]:
        if rite == RiteType.ORDINARIO:
            return [
                ProceduralPhase.POSTULATORIO,
                ProceduralPhase.SANEAMENTO,
                ProceduralPhase.INSTRUTORIO,
                ProceduralPhase.DECISORIO,
                ProceduralPhase.RECURSAL,
                ProceduralPhase.EXECUCAO
            ]
        return [ProceduralPhase.POSTULATORIO, ProceduralPhase.DECISORIO] # Fallback simplified
