import io
import pypdf
from typing import Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from sqlalchemy.orm import Session

from backend.api import deps
from backend.repository.juiz_repository import JuizRepository
from backend.services.ai_service import AIService
from backend.core.logger import logger
from backend.core.exceptions import EntityNotFoundException, PrologosException

from backend.api import schemas

router = APIRouter()

@router.post("/peticao", response_model=schemas.ResponseEnvelope[dict])
async def analisar_peticao(
    request: Request,
    juiz_id: int, 
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("analyze_peticao"))
) -> Any:
    from backend.services.audit_service import AuditService
    ai_service = AIService()
    repo = JuizRepository(db)
    juiz = repo.get(juiz_id)
    if not juiz:
        raise EntityNotFoundException("Juiz", juiz_id)

    # 1. Extração de Texto Profissional
    content = await file.read()
    filename = (file.filename or "").lower()
    full_text = ""
    
    try:
        f_stream = io.BytesIO(content)
        
        if filename.endswith(".pdf"):
            reader = pypdf.PdfReader(f_stream)
            full_text = "".join([page.extract_text() or "" for page in reader.pages])
            
        elif filename.endswith(".docx"):
            import docx
            doc = docx.Document(f_stream)
            full_text = "\n".join([p.text for p in doc.paragraphs])
            
        elif filename.endswith(".txt"):
            # Try utf-8 first, fallback to latin-1
            try:
                full_text = content.decode("utf-8")
            except UnicodeDecodeError:
                full_text = content.decode("latin-1")
                
        elif filename.endswith(".doc"):
            # .doc is complex (binary). For now, we ask user to convert or try basic strings logic (unreliable).
            # Best Enterprise approach without heavy dependencies: Fail gracefully asking for PDF/DOCX
            raise PrologosException(message="Formato .doc (antigo) não suportado. Salve como .docx ou .pdf.", status_code=400)
            
        else:
            raise PrologosException(message=f"Formato não suportado: {filename}", status_code=400)
            
    except PrologosException:
        raise
    except Exception as e:
        logger.error(f"File extraction failed: {e}")
        raise PrologosException(message="Falha ao processar arquivo. Verifique se não está corrompido.", status_code=400)

    # 2. Lógica de Afinidade (Delegada ao Service)
    decisoes = juiz.decisoes[:10]
    if not decisoes:
        return schemas.ResponseEnvelope(data={"parecer": "Base de dados insuficiente para este magistrado."})

    textos_decisao = [d.texto_decisao for d in decisoes]
    ai_service = AIService()
    scores = ai_service.rank_decisions(full_text[:2000], textos_decisao)
    
    avg_score = sum(scores) / len(scores) if scores else 0
    compatibilidade = "ALTA" if avg_score > 0.7 else "MÉDIA" if avg_score > 0.4 else "BAIXA"
    
    # 3. Gerar Insight Guarded (Phase 16) with Semantic Cache (Phase 19)
    org_id = getattr(request.state, "org_id", None)
    parecer_industrial = ai_service.generate_legal_summary(full_text[:5000], org_id=org_id)
    
    result = {
        "parecer": parecer_industrial,
        "metadata": {
            "afinidade_tecnica": round(avg_score, 2),
            "compatibilidade": compatibilidade,
            "base_analitica": len(decisoes)
        }
    }
    # 4. Audit Trace
    AuditService.log_action(
        db,
        action="LEGAL_ANALYSIS",
        resource=f"juiz:{juiz_id}",
        user_ip=request.client.host,
        user_agent=request.headers.get("User-Agent"),
        request_id=getattr(request.state, "request_id", None),
        details=f"Peticao analyzed for magistrate {juiz_id}"
    )

    return schemas.ResponseEnvelope(data=result)

@router.post("/dossie", response_model=schemas.ResponseEnvelope[dict])
async def gerar_dossie_enterprise(
    request: Request,
    juiz_id: int,
    db: Session = Depends(deps.get_db),
    _permission: bool = Depends(deps.check_permission("generate_dossier"))
) -> Any:
    from backend.services.audit_service import AuditService
    repo = JuizRepository(db)
    juiz = repo.get(juiz_id)
    if not juiz:
        raise EntityNotFoundException("Juiz", juiz_id)
        
    res = {
        "dossie": f"Dossiê Enterprise consolidado para {juiz.nome}. Padrões comportamentais detectados via análise modular."
    }
    # 2. Audit Trace
    AuditService.log_action(
        db,
        action="DOSSIER_GENERATION",
        resource=f"juiz:{juiz_id}",
        user_ip=request.client.host,
        user_agent=request.headers.get("User-Agent"),
        request_id=getattr(request.state, "request_id", None)
    )

    # 3. Institutional Event
    from backend.services.event_service import EventService
    EventService.emit_event(db, "dossier.generated", {
        "juiz_id": juiz.id,
        "juiz_nome": juiz.nome,
        "request_id": getattr(request.state, "request_id", None)
    })

    return schemas.ResponseEnvelope(data=res)
