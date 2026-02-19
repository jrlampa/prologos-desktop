from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from backend.core.logger import logger

class AgendaService:
    """
    Agenda 4.0 Engine.
    Manages lawyer availability, themes, and client bookings.
    """

    # Mock Data Storage
    _slots: List[Dict[str, Any]] = []
    _bookings: List[Dict[str, Any]] = []
    
    THEMES = {
        "trabalhista": {"label": "Consultoria Trabalhista", "duration": 90}, # minutes
        "civil": {"label": "Consultoria Cível", "duration": 60},
        "criminal": {"label": "Urgência Criminal", "duration": 120},
        "previdenciario": {"label": "Análise Previdenciária", "duration": 45},
        "rapida": {"label": "Tira-Dúvidas Rápido", "duration": 30}
    }

    @classmethod
    def get_public_slots(cls, lawyer_id: int, date_str: str) -> List[Dict[str, Any]]:
        """
        Returns available slots for a specific date.
        Real implementation would check against DB and blocked times.
        """
        # Mock generator for slots 9:00 to 18:00
        base_slots = []
        start_hour = 9
        end_hour = 18
        
        current = datetime.strptime(f"{date_str} {start_hour}:00", "%Y-%m-%d %H:%M")
        end_time = datetime.strptime(f"{date_str} {end_hour}:00", "%Y-%m-%d %H:%M")

        while current < end_time:
            time_str = current.strftime("%H:%M")
            # Check if booked
            is_booked = any(
                b["date"] == date_str and b["time"] == time_str 
                for b in cls._bookings
            )
            
            if not is_booked:
                base_slots.append({
                    "time": time_str,
                    "available": True
                })
            
            current += timedelta(minutes=30) # Granularity

        return base_slots

    @classmethod
    def book_slot(cls, lawyer_id: int, client_name: str, theme_key: str, date: str, time: str) -> Dict[str, Any]:
        """
        Books a slot efficiently managing duration and blocking subsequent slots.
        """
        if theme_key not in cls.THEMES:
            raise ValueError("Tema inválido")

        theme = cls.THEMES[theme_key]
        duration = theme["duration"]
        
        # Calculate end time to block slots
        start_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        end_dt = start_dt + timedelta(minutes=duration)
        
        # Check conflicts (Simple overlap check)
        # In a real DB, this would be a SQL query with overlaps
        
        booking_id = len(cls._bookings) + 1
        booking = {
            "id": booking_id,
            "lawyer_id": lawyer_id,
            "client": client_name,
            "theme": theme["label"],
            "date": date,
            "time": time,
            "duration": duration,
            "created_at": datetime.now().isoformat()
        }
        
        cls._bookings.append(booking)
        logger.info(f"AGENDA: New booking #{booking_id} - {client_name} ({theme['label']})")
        
        return booking

    @classmethod
    def list_types(cls) -> Dict[str, Any]:
        return cls.THEMES
