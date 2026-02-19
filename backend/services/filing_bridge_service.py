import logging
import os
from typing import Optional, Dict, Any
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_JUSTIFY

logger = logging.getLogger(__name__)

class FilingBridgeService:
    """
    Sovereign Filing Bridge Service v2.0.
    Generates professional, ABNT-compliant legal petitions.
    """

    @classmethod
    def compose_petition(cls, strategy_data: Dict[str, Any], manual_content: Optional[str] = None) -> bytes:
        """
        Composes a petition and returns it as PDF bytes.
        Delegates styling to ABNTStyles (SRP focus).
        """
        from backend.services.abnt_styles import ABNTStyles
        
        content = manual_content if manual_content else strategy_data.get("synthesis", "Petição Inicial")
        buffer = BytesIO()
        
        # 1. Setup Document with Sovereign Margins
        margins = ABNTStyles.get_document_margins()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=margins['top'],
            leftMargin=margins['left'],
            bottomMargin=margins['bottom'],
            rightMargin=margins['right']
        )
        
        # 2. Get Sovereign Styles
        legal_style = ABNTStyles.get_legal_body_style()
        header_style = ABNTStyles.get_legal_header_style()
        
        elements = []
        
        # 3. Addressing
        tribunal = strategy_data.get('tribunal', 'EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE...')
        elements.append(Paragraph(tribunal.upper(), header_style))
        elements.append(Spacer(1, 2*cm))
        
        # 4. Body Content
        paragraphs = content.split('\n')
        for p in paragraphs:
            if p.strip():
                elements.append(Paragraph(p.strip(), legal_style))
        
        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
