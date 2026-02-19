from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.units import cm

class ABNTStyles:
    """
    Centralized repository for ABNT NBR 14724 compliant styles.
    """
    
    @staticmethod
    def get_legal_body_style():
        styles = getSampleStyleSheet()
        return ParagraphStyle(
            'LegalBody',
            parent=styles['Normal'],
            fontName='Times-Roman',
            fontSize=12,
            leading=18, # 1.5 spacing
            alignment=TA_JUSTIFY,
            firstLineIndent=1.25*cm,
            spaceAfter=12
        )

    @staticmethod
    def get_legal_header_style():
        styles = getSampleStyleSheet()
        return ParagraphStyle(
            'LegalHeader',
            parent=styles['Normal'],
            fontName='Times-Bold',
            fontSize=12,
            alignment=TA_JUSTIFY,
            spaceAfter=30
        )

    @staticmethod
    def get_document_margins():
        """ABNT Standards: 3cm top/left, 2cm bottom/right"""
        return {
            "top": 3*cm,
            "left": 3*cm,
            "bottom": 2*cm,
            "right": 2*cm
        }
