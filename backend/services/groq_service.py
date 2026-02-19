import os
import logging
from typing import Optional, Dict, Any, List

# Try importing Groq, handle missing package gracefully
try:
    from groq import Groq
except ImportError:
    Groq = None

logger = logging.getLogger(__name__)

class GroqService:
    """
    Service for interacting with Groq LLM API (Llama 3).
    Based on legacy script: scripts/test_groq_integration.py
    """
    
    _client = None
    
    @classmethod
    def get_client(cls):
        if cls._client:
            return cls._client
            
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY not set.")
            return None
            
        if not Groq:
            logger.warning("groq package not installed.")
            return None
            
        try:
            cls._client = Groq(api_key=api_key)
            return cls._client
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            return None

    @classmethod
    def generate_legal_draft(cls, thesis: str, context: Optional[str] = None) -> str:
        """
        Generates a legal draft based on a thesis and context.
        """
        client = cls.get_client()
        if not client:
            return "AI Draft Generation Unavailable (Missing Key or Package)"
            
        system_prompt = (
            "Você é um Assistente Jurídico de Elite. "
            "Sua tarefa é redigir um parágrafo argumentativo técnico, formal e persuasivo "
            "para uma peça processual, baseando-se na tese solicitada."
        )
        
        user_content = f"Tese: {thesis}\n"
        if context:
            user_content += f"Contexto Fático: {context}\n"
            
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                model="llama3-70b-8192",
                temperature=0.5,
                max_tokens=800
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq Draft Error: {e}")
            return f"Erro na geração de redação: {str(e)}"

    @classmethod
    def generate_legal_summary(cls, text: str, context: str = "general") -> str:
        """
        Generates a concise legal summary of a text.
        """
        client = cls.get_client()
        if not client:
            return "AI Summary Unavailable"
            
        system_prompt = (
            "Resuma o texto jurídico abaixo de forma executiva, "
            "destacando pontos chave, riscos e prazos se houver."
        )
        
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text[:8000]}, # Token limit safeguard
                ],
                model="llama3-70b-8192",
                temperature=0.3, 
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq Summary Error: {e}")
            return f"Erro no resumo de IA: {str(e)}"

    @classmethod
    def analyze_case_text(cls, case_text: str, context: str = "general") -> str:
        """
        Analyzes case text using Groq/Llama3.
        """
        client = cls.get_client()
        if not client:
            return "AI Analysis Unavailable (Missing Key or Package)"

        # Prompt Engineering based on legacy script
        system_prompt = (
            "Você é um Consultor Jurídico Senior Especialista em Processo Civil Brasileiro. "
            "Analise os dados do processo fornecidos e forneça um parecer curto e direto (máx 3 linhas) "
            "sobre a probabilidade de êxito e o estágio atual. "
            "Seja técnico mas acessível."
        )
        
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Dados do Processo:\n{case_text}"},
                ],
                model="llama3-70b-8192", # Defaulting to a strong model
                temperature=0.3,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API Error: {e}")
            return f"Erro na análise de IA: {str(e)}"

    @classmethod
    def available(cls) -> bool:
        return bool(os.getenv("GROQ_API_KEY") and Groq)
