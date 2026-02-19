import requests
import os
import sys

def main():
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
    ml_service_url = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

    print(f"--- Testando Integração Backend <-> ML Service ---")
    
    # 1. Verifica Health do ML Service
    try:
        resp = requests.get(f"{ml_service_url}/health")
        resp.raise_for_status()
        print(f"[OK] ML Service está online: {resp.json()}")
    except Exception as e:
        print(f"[ERRO] ML Service offline em {ml_service_url}: {e}")
        return

    # 2. Verifica Health do Backend
    try:
        resp = requests.get(f"{backend_url}/")
        resp.raise_for_status()
        print(f"[OK] Backend está online: {resp.json()}")
    except Exception as e:
        print(f"[ERRO] Backend offline em {backend_url}: {e}")
        # Note: We continue even if backend is offline to show the logs, 
        # but in a real scenario we might stop here.

    print("\n[INFO] Para testar o endpoint /api/analise/peticao, é necessário um juiz com decisões no banco.")
    print("[INFO] e o envio de um arquivo PDF real via multipart/form-data.")
    print("[TIP] Você pode rodar este script em um ambiente onde ambos os serviços estejam ativos.")

if __name__ == "__main__":
    main()
