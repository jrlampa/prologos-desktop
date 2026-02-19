import requests
from typing import Dict, Any, Optional
from backend.core.logger import logger

class GovBrService:
    BASE_URL = "https://brasilapi.com.br/api"

    @staticmethod
    def consultar_cnpj(cnpj: str) -> Dict[str, Any]:
        """
        Consulta dados de um CNPJ na BrasilAPI (Dados públicos da Receita Federal).
        """
        # Remove caracteres não numéricos
        clean_cnpj = "".join(filter(str.isdigit, cnpj))
        
        try:
            logger.info(f"Consultando CNPJ na BrasilAPI: {clean_cnpj}")
            response = requests.get(f"{GovBrService.BASE_URL}/cnpj/v1/{clean_cnpj}", timeout=10)
            
            if response.status_code == 404:
                return {"status": "error", "message": "CNPJ não encontrado."}
            
            if response.status_code != 200:
                logger.error(f"Erro BrasilAPI: {response.status_code} - {response.text}")
                return {"status": "error", "message": "Erro ao consultar fonte oficial."}
                
            data = response.json()
            
            # Formata resposta padrão Enterprise do Prólogos
            return {
                "status": "success",
                "source": "Receita Federal (via BrasilAPI)",
                "data": {
                    "razao_social": data.get("razao_social"),
                    "nome_fantasia": data.get("nome_fantasia"),
                    "cnpj": data.get("cnpj"),
                    "situacao_cadastral": data.get("situacao_cadastral"),
                    "data_inicio_atividade": data.get("data_inicio_atividade"),
                    "cnae_principal": data.get("cnae_fiscal_descricao"),
                    "natureza_juridica": data.get("natureza_juridica"),
                    "endereco": {
                        "logradouro": data.get("logradouro"),
                        "numero": data.get("numero"),
                        "complemento": data.get("complemento"),
                        "bairro": data.get("bairro"),
                        "municipio": data.get("municipio"),
                        "uf": data.get("uf"),
                        "cep": data.get("cep")
                    },
                    "socios": data.get("qsa", []),
                    "capital_social": data.get("capital_social")
                }
            }
            
        except Exception as e:
            logger.error(f"GovBrService Exception: {e}")
            return {"status": "error", "message": str(e)}
