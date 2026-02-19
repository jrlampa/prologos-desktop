from datetime import datetime, timedelta
from typing import List, Optional, Dict
from backend.core.logger import logger

class BrazilianLegalService:
    """
    Lawyer-Centric Intelligence: Brazilian Procedural Excellence.
    Implements specific logic for CPC/2015, justice systems (PJe/e-SAJ), 
    and forensic deadline calculations.
    """
    
    @staticmethod
    def calculate_deadline(start_date: datetime, days: int, is_working_days: bool = True) -> datetime:
        """
        Calculates legal deadlines according to Brazilian CPC (Working Days).
        Excludes weekends and (simulated) national forensic holidays.
        """
        current_date = start_date
        days_added = 0
        
        # Simulated forensic holidays (Brazil - simplified for POC)
        holidays = [
            # Standard holidays would be loaded from a database or config
            "2026-01-01", "2026-05-01", "2026-09-07", "2026-10-12", "2026-11-02", "2026-11-15", "2026-12-25"
        ]
        
        while days_added < days:
            current_date += timedelta(days=1)
            
            if is_working_days:
                # 0=Monday, 6=Sunday. CPC counts only business days (Mon-Fri)
                if current_date.weekday() < 5 and current_date.strftime("%Y-%m-%d") not in holidays:
                    days_added += 1
            else:
                days_added += 1
                
        return current_date

    @staticmethod
    def get_procedural_guide(context: str) -> Dict[str, str]:
        """Provides lawyer-centric guidance for specific Brazilian procedural steps."""
        guides = {
            "contestacao": {
                "prazo": "15 dias úteis",
                "base_legal": "Art. 335, CPC",
                "dica_pro": "Verifique se houve audiência de conciliação antes de contar o prazo."
            },
            "recurso_apelacao": {
                "prazo": "15 dias úteis",
                "base_legal": "Art. 1.003, § 5º, CPC",
                "dica_pro": "Prepare o preparo recursal antecipadamente para evitar deserção."
            },
            "embargos_declaracao": {
                "prazo": "5 dias úteis",
                "base_legal": "Art. 1.023, CPC",
                "dica_pro": "Utilize apenas para omissão, contradição ou obscuridade."
            }
        }
        return guides.get(context, {"prazo": "Consulte o CPC", "base_legal": "N/A", "dica_pro": "Verifique o rito processual."})

    @staticmethod
    def get_system_intelligence(system_name: str) -> str:
        """Intelligence for interacting with Brazilian justice digital systems."""
        systems = {
            "PJe": "Focado em tribunais federais e alguns estaduais. Requer assinatura digital via token (A3).",
            "e-SAJ": "Comum em Tribunais Estaduais (ex: TJSP). Permite consulta por número de processo ou OAB.",
            "Projudi": "Utilizado em diversos estados. Foco em Juizados Especiais."
        }
        return systems.get(system_name, "Sistema não catalogado. Verifique os requisitos do Tribunal.")
