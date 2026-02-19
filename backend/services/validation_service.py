import re
from typing import Optional
from backend.core.exceptions import PrologosException

class ValidationService:
    @staticmethod
    def validate_cnj(process_number: str) -> bool:
        """
        Validate Brazilian Process Number (CNJ standard: NNNNNNN-DD.YYYY.J.TR.OOOO).
        Uses the MOD97 check digit algorithm.
        """
        # Remove non-numeric characters for processing
        clean_number = re.sub(r"\D", "", process_number)
        
        if len(clean_number) != 20:
            return False
            
        # CNJ Format: NNNNNNN-DD.YYYY.J.TR.OOOO
        # NNNNNNN: Número seqüencial
        # DD: Dígitos verificadores
        # YYYY: Ano do ajuizamento
        # J: Órgão do Poder Judiciário
        # TR: Tribunal
        # OOOO: Unidade de origem
        
        # Validation Logic (MOD97)
        # 1. Split the parts: (NNNNNNN)(YYYY)(J)(TR)(OOOO)(DD)
        nn = clean_number[:7]
        dd = clean_number[7:9]
        yyyy = clean_number[9:13]
        j = clean_number[13:14]
        tr = clean_number[14:16]
        oooo = clean_number[16:20]
        
        # 2. Rearrange for MOD97: NNNNNNNYYYYJTR OOOO 00
        # Formula: DV = 98 - (NNNNNNNYYYYJTR OOOO 00 % 97)
        # We must use string integer conversion for the large part
        rearranged = f"{nn}{yyyy}{j}{tr}{oooo}"
        
        try:
            # Calculation
            val = int(rearranged) * 100
            remainder = val % 97
            dv = 98 - remainder
            
            # If dv is 100? No, mod 97 ensures remainders 0-96.
            # 98 - 0 = 98. 98 - 96 = 2.
            # Wait, the spec says: 98 - (N % 97). 
            # If N % 97 is 1, dv is 97.
            # If N % 97 is 0, dv is 98? No, the spec says 97 - ((N*100)%97) + 1
            # Let's use the simple: (97 - (remainder - 1)) if remainder > 0 else 97?
            # Actually, the standard is: dd = 98 - ( (int(nnnnnnn + yyyyjtroooo) * 100) % 97 )
            
            calculated_dd = 98 - ( (int(f"{nn}{yyyy}{j}{tr}{oooo}") * 100) % 97 )
            return int(dd) == calculated_dd
        except Exception:
            return False

    @staticmethod
    def ensure_cnj(process_number: str):
        """Raise exception if CNJ is invalid."""
        if not ValidationService.validate_cnj(process_number):
            raise PrologosException(
                f"Número de processo inválido (Padrão CNJ esperado): {process_number}",
                status_code=400
            )
