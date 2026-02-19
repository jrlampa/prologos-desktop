from backend.core.logger import logger
from backend.services.transformation_service import TransformationService

class DataJudService:
    @staticmethod
    def clone_judge_profile(process_number: str, progress_cb=None) -> dict:
        """
        Industrial ingestion with integrated transformation and enrichment.
        """
        try:
            # 1. Capture Raw Data (Legacy Proxy)
            from backend.services.ingestors import datajud_legacy
            raw_payload = datajud_legacy.clonar_perfil_juiz_payload(
                process_number, 
                progress_cb=progress_cb
            )
            
            if not raw_payload.get("sucesso"):
                return raw_payload

            # 2. Institutional Transformation & Enrichment
            logger.info("Raw Ingestion Success. Starting Enterprise Transformation...")
            enriched_payload = TransformationService.enrich_judge_profile(raw_payload)
            
            # Merge enrichment back into response envelope
            raw_payload.update(enriched_payload)
            raw_payload["transformation_applied"] = True
            
            return raw_payload
            
        except Exception as e:
            logger.error(f"DataJud Ingestion/Transformation Error: {e}")
            return {"sucesso": False, "msg": f"Erro industrial na ingestão: {str(e)}"}
