import { contextBridge } from "electron";

// Mantemos vazio por enquanto; reservado para futuras integrações (ex.: abrir arquivo).
contextBridge.exposeInMainWorld("prologos", {
  version: "0.1.0",
});

