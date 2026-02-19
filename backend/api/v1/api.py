from fastapi import APIRouter
from backend.api.v1.endpoints import (
    juizes,
    analise,
    governance,
    reporting,
    webhooks,
    health_dashboard,
    market_radar,
    brazilian_legal,
    jurisprudence,
    lifestyle,
    notifications,
    workflow,
    batch,
    agenda,
    finance,
    crawler,
    jurisdiction,
    communication,
    evolution,
    login,
    gov,
    audit,
    litigation,
    legal_ai,
    interop
)

api_router = APIRouter()

api_router.include_router(juizes.router, prefix="/juizes", tags=["Magistrados"])
api_router.include_router(analise.router, prefix="/analise", tags=["Análise Jurimétrica"])
api_router.include_router(governance.router, prefix="/governance", tags=["Governança e Auditoria"])
api_router.include_router(reporting.router, prefix="/reporting", tags=["Inteligência Industrial"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Interoperabilidade Enterprise"])
api_router.include_router(health_dashboard.router, prefix="/observability", tags=["Observabilidade e SLAs"])
api_router.include_router(market_radar.router, prefix="/market", tags=["Inteligência de Mercado"])
api_router.include_router(brazilian_legal.router, prefix="/legal", tags=["Prerrogativas e Prazos Judiciais"])
api_router.include_router(jurisprudence.router, prefix="/jurisprudence", tags=["Jurisprudência Neural & Precedentes"])
api_router.include_router(lifestyle.router, prefix="/lifestyle", tags=["Estilo de Vida & Produtividade Jurídica"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Central de Notificações e Alertas"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["Orquestração de Fluxos Jurídicos"])
api_router.include_router(batch.router, prefix="/batch", tags=["Operações em Lote & Contencioso de Massa"])
api_router.include_router(agenda.router, prefix="/agenda", tags=["Agenda 4.0 & Conectividade Cliente"])
api_router.include_router(finance.router, prefix="/finance", tags=["Soberania Financeira & Honorários"])
api_router.include_router(crawler.router, prefix="/crawler", tags=["Crawler DataJud & Clonagem de Casos"])
api_router.include_router(jurisdiction.router, prefix="/jurisdiction", tags=["Inteligência de Jurisdição & Radar de Sucesso"])
api_router.include_router(communication.router, prefix="/communication", tags=["Soberania Omnichannel (WhatsApp)"])
api_router.include_router(evolution.router, prefix="/evolution", tags=["Infraestrutura Evolution (V2)"])
api_router.include_router(login.router, prefix="/login", tags=["Autenticação & Segurança"])
api_router.include_router(gov.router, prefix="/gov", tags=["Gov.br & Dataprev"])
api_router.include_router(audit.router, prefix="/audit", tags=["Sovereign Audit & Forensic Trace"])
api_router.include_router(litigation.router, prefix="/litigation", tags=["Litigation Monitoring & DJe"])
api_router.include_router(legal_ai.router, prefix="/legal-ai", tags=["Sovereign Legal AI Analyst"])
api_router.include_router(interop.router, prefix="/interop", tags=["Sovereign Interoperability & Global Consumption"])
