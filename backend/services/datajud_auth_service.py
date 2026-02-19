import requests
import re
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class DataJudAuthService:
    WIKI_URL = "https://datajud-wiki.cnj.jus.br/api-publica/acesso"
    API_KEY_REGEX = r"APIKey\s+([a-zA-Z0-9\+\/\=]+)"
    ENV_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

    @staticmethod
    def fetch_latest_key() -> str:
        """
        Scrapes the DataJud Wiki page to find the latest 'Authorization: APIKey ...'
        """
        try:
            logger.info(f"Fetching DataJud Key from {DataJudAuthService.WIKI_URL}...")
            resp = requests.get(DataJudAuthService.WIKI_URL, timeout=10)
            resp.raise_for_status()
            
            # The page usually contains "Authorization: APIKey <KEY>" in the text
            content = resp.text
            match = re.search(DataJudAuthService.API_KEY_REGEX, content)
            
            if match:
                new_key = match.group(1)
                logger.info("Successfully extracted DataJud API Key from Wiki.")
                return new_key
            else:
                logger.error("Could not find 'APIKey' pattern in Wiki content.")
                raise ValueError("Pattern 'APIKey' not found in DataJud Wiki.")
                
        except Exception as e:
            logger.error(f"Failed to fetch DataJud Key: {str(e)}")
            raise

    @staticmethod
    def update_env_file(new_key: str):
        """
        Updates the .env file with the new DATAJUD_API_KEY.
        This is a 'hot' update for the current persistent environment.
        """
        try:
            if not os.path.exists(DataJudAuthService.ENV_FILE_PATH):
                logger.warning(f".env file not found at {DataJudAuthService.ENV_FILE_PATH}. Creating new one.")
                
            # Read existing lines
            lines = []
            if os.path.exists(DataJudAuthService.ENV_FILE_PATH):
                with open(DataJudAuthService.ENV_FILE_PATH, "r", encoding="utf-8") as f:
                    lines = f.readlines()
            
            # Update or Append
            key_found = False
            new_lines = []
            for line in lines:
                if line.startswith("DATAJUD_API_KEY="):
                    new_lines.append(f"DATAJUD_API_KEY={new_key}\n")
                    key_found = True
                else:
                    new_lines.append(line)
            
            if not key_found:
                new_lines.append(f"\nDATAJUD_API_KEY={new_key}\n")
            
            # Write back
            with open(DataJudAuthService.ENV_FILE_PATH, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
                
            # Update OS Environment for current process immediate usage
            os.environ["DATAJUD_API_KEY"] = new_key
            logger.info(f"Updated .env and os.environ with new DataJud Key.")
            
        except Exception as e:
            logger.error(f"Failed to update .env file: {str(e)}")
            raise

    @staticmethod
    def rotate_key_if_needed():
        """
        Orchestrates the check and update.
        Returns the new key.
        """
        logger.info("Starting DataJud Key Rotation...")
        try:
            new_key = DataJudAuthService.fetch_latest_key()
            current_key = os.getenv("DATAJUD_API_KEY")
            
            if new_key != current_key:
                logger.info("Key mismatch detected. Rotating key...")
                DataJudAuthService.update_env_file(new_key)
                return new_key
            else:
                logger.info("Key is already up to date.")
                return current_key
        except Exception as e:
            logger.error(f"Key rotation failed: {e}")
            # If we fail to rotate, we might return None or raise
            raise
