import crcmod
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class FinanceService:
    """
    Sovereign Finance Service.
    Handles Pix (Brazilian Instant Payment) BR Code Generation.
    Standard: EMV QRCPS MPM (Merchant Presented Mode).
    """

    @staticmethod
    def _calculate_crc16(payload: str) -> str:
        """
        Calculates the CRC16-CCITT (0xFFFF) for the Pix payload.
        """
        crc16_func = crcmod.mkCrcFun(0x11021, initCrc=0xFFFF, rev=False, xorOut=0x0000)
        crc_value = crc16_func(payload.encode('utf-8'))
        return f"{crc_value:04X}" 

    @staticmethod
    def generate_pix_payload(
        pix_key: str,
        merchant_name: str,
        merchant_city: str,
        amount: Optional[str] = None,
        txtid: str = "***"
    ) -> Dict[str, Any]:
        """
        Generates the Copy & Paste Pix String (EMV Standard).
        
        IDs:
        00 - Payload Format Indicator (01)
        26 - Merchant Account Information (GUI + Key)
        52 - Merchant Category Code (0000)
        53 - Transaction Currency (986 - BRL)
        54 - Transaction Amount (Optional)
        58 - Country Code (BR)
        59 - Merchant Name
        60 - Merchant City
        62 - Additional Data Field (TxID)
        63 - CRC16
        """
        
        def format_field(id_code: str, value: str) -> str:
            length = len(value)
            return f"{id_code}{length:02d}{value}"

        merchant_account = (
            format_field("00", "br.gov.bcb.pix") + 
            format_field("01", pix_key)
        )

        payload = (
            format_field("00", "01") + 
            format_field("26", merchant_account) + 
            format_field("52", "0000") + 
            format_field("53", "986")
        )

        if amount:
            # Format 1.00
            payload += format_field("54", f"{float(amount):.2f}")

        payload += (
            format_field("58", "BR") + 
            format_field("59", merchant_name[:25]) + 
            format_field("60", merchant_city[:15]) + 
            format_field("62", format_field("05", txtid[:25])) + 
            "6304" # CRC placeholder
        )

        crc = FinanceService._calculate_crc16(payload)
        full_payload = payload + crc
        
        return {
            "payload": full_payload,
            "qr_base64": None # Frontend handles QR generation or use external lib if needed
        }
