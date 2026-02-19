from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAIService(ABC):
    @abstractmethod
    def get_health(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def rank_decisions(self, petition_text: str, candidates: List[str]) -> List[float]:
        pass
