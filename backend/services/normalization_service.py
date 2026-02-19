import re
import unicodedata
from typing import List, Optional

class NormalizationService:
    @staticmethod
    def clean_legal_text(text: str) -> str:
        """
        Professional cleaning of raw legal texts.
        Removes HTML tags, normalizes whitespace and unicode characters.
        """
        if not text:
            return ""
            
        # 1. Remove HTML/XML tags
        text = re.sub(r'<[^>]*>', ' ', text)
        
        # 2. Normalize Unicode (NFC)
        text = unicodedata.normalize('NFC', text)
        
        # 3. Standardize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # 4. Remove institutional noise (e.g. repetitive headers)
        # This can be expanded with institutional rules
        
        return text

    @staticmethod
    def format_money(value: float) -> str:
        """Standardize monetary representation for reporting."""
        return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Ensure filenames satisfy institutional storage standards."""
        return re.sub(r'[^\w\-_\.]', '_', filename)
