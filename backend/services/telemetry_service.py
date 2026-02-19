import os
import shutil
import platform
from typing import Dict, Any
from backend.core.logger import logger

try:
    import psutil
except ImportError:
    psutil = None

class TelemetryService:
    @staticmethod
    def get_system_metrics() -> Dict[str, Any]:
        """
        Collect industrial hardware telemetry.
        """
        metrics = {
            "platform": platform.system(),
            "cpu_usage_pct": 0.0,
            "memory": {"total": 0, "available": 0, "percent": 0.0},
            "disk": {"total": 0, "free": 0, "used_pct": 0.0}
        }
        
        try:
            # CPU & RAM (psutil required for high precision)
            if psutil:
                metrics["cpu_usage_pct"] = psutil.cpu_percent(interval=0.1)
                mem = psutil.virtual_memory()
                metrics["memory"] = {
                    "total": mem.total,
                    "available": mem.available,
                    "percent": mem.percent
                }
            
            # Disk (standard library)
            total, used, free = shutil.disk_usage("/")
            usage_pct = (used / total) * 100
            metrics["disk"] = {
                "total": total,
                "free": free,
                "used_pct": round(float(usage_pct), 2)
            }
            
        except Exception as e:
            logger.error(f"Telemetry Collection Error: {e}")
            
        return metrics
