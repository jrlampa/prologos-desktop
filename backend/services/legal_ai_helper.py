import json
import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LegalAIHelper:
    """
    Sovereign AI Parsing Helper.
    Encapsulates fragile logic for extracting structured data from LLM responses.
    """

    @staticmethod
    def extract_structured_json(raw_response: str) -> Dict[str, Any]:
        """
        Extracts JSON from AI text response with senior-grade resilience.
        Handles nested blocks and malformed prefixes.
        """
        try:
            # First attempt: Traditional regex for { ... }
            match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if match:
                return json.loads(match.group())
            
            # Second attempt: Look for markdown code blocks ```json ... ```
            code_block_match = re.search(r'```json\s*(.*?)\s*```', raw_response, re.DOTALL)
            if code_block_match:
                return json.loads(code_block_match.group(1))
                
            return {}
        except Exception as e:
            logger.error(f"SRP AI Parse Failure: {e}. Raw snippet: {raw_response[:50]}...")
            return {}

    @staticmethod
    def clean_day_string(days_str: str) -> int:
        """Extracts integer days from potentially dirty AI strings (e.g., '15 dias')."""
        try:
            match = re.search(r'\d+', str(days_str))
            return int(match.group()) if match else 0
        except:
            return 0
