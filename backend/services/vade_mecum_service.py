from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class StatutoryAnchor(BaseModel):
    article: str
    description: str
    law: str = "CPC/2015"
    link: str

class VadeMecumService:
    """
    Sovereign Statutory Mesh.
    Links procedural rituals to specific legal articles.
    """
    
    # Static database of core procedural articles
    MESH = {
        "Postulatório": [
            {"article": "Art. 319", "description": "Requisitos da Petição Inicial", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art319"},
            {"article": "Art. 335", "description": "Prazo para Contestação", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art335"}
        ],
        "Saneamento": [
            {"article": "Art. 357", "description": "Decisão de Saneamento e Organização", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art357"}
        ],
        "Instrução": [
            {"article": "Art. 361", "description": "Ordem dos Trabalhos na Audiência", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art361"},
            {"article": "Art. 464", "description": "Produção de Prova Pericial", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art464"}
        ],
        "Decisório": [
            {"article": "Art. 489", "description": "Elementos Essenciais da Sentença", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art489"}
        ],
        "Recursal": [
            {"article": "Art. 1.003", "description": "Prazo para Interposição de Recursos", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art1003"},
            {"article": "Art. 1.009", "description": "Recurso de Apelação", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art1009"}
        ],
        "Execução": [
            {"article": "Art. 523", "description": "Cumprimento de Sentença (Pagamento)", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art523"},
            {"article": "Art. 829", "description": "Execução por Quantia Certa", "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art829"}
        ]
    }

    @classmethod
    def get_anchors_for_phase(cls, phase: str) -> List[Dict[str, str]]:
        """
        Returns verified legal articles for a given procedural phase.
        """
        return cls.MESH.get(phase, [])

    @classmethod
    def get_links_for_text(cls, text: str) -> List[Dict[str, str]]:
        """
        Heuristic search for article mentions in AI text.
        """
        found = []
        # Basic heuristic to avoid overhead
        if "Art. 319" in text: found.append(cls.MESH["Postulatório"][0])
        if "Art. 335" in text: found.append(cls.MESH["Postulatório"][1])
        # ... could be expanded with regex
        return found

from pydantic import BaseModel
