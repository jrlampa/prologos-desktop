import { Router } from "express";

import crypto from "node:crypto";

import {
  cacheGetDataJud,
  cacheSetDataJud,
  createJob,
  getJob,
  persistCloneResult,
  updateJob,
} from "../db.js";
import { clonarPerfilJuizPayload } from "../desktop/datajud.js";

export function createJobsRouter({ db, fastapiBaseUrl } = {}) {
  const router = Router();

  // Desktop-first: rodar clonagem localmente (sem Redis/Python).
  // Mantemos compat com proxy via FASTAPI_BASE_URL quando PROLOGOS_DESKTOP_MODE não estiver ativo.
  const desktopMode = (process.env.PROLOGOS_DESKTOP_MODE || "true").toLowerCase() in {
    "1": true,
    true: true,
    yes: true,
    y: true,
  };

  // Jobs: clonagem via DataJud (desktop all-in-one)
  router.post("/clonar-juiz", async (req, res, next) => {
    try {
      const numero_processo = (req.body?.numero_processo ?? "").toString().trim();
      if (!numero_processo) {
        return res.status(400).json({ detail: "numero_processo é obrigatório." });
      }

      const jobId = crypto.randomUUID().replace(/-/g, "");
      createJob(db, { id: jobId, numero_processo });

      // roda async (in-process) sem bloquear request
      setImmediate(async () => {
        try {
          updateJob(db, jobId, { status: "running", progress: 1, message: "Iniciando clonagem…" });

          const apiKey = process.env.DATAJUD_API_KEY || "";
          const payload = await clonarPerfilJuizPayload(numero_processo, {
            apiKey,
            cacheGet: async (k) => cacheGetDataJud(db, k),
            cacheSet: async (k, v, ttl) => cacheSetDataJud(db, k, v, ttl),
            progressCb: (pct, msg) => {
              updateJob(db, jobId, {
                progress: Math.max(0, Math.min(100, Number(pct) || 0)),
                message: String(msg || ""),
              });
            },
          });

          if (!payload?.sucesso) {
            updateJob(db, jobId, {
              status: "failed",
              progress: 100,
              message: "Falha na clonagem.",
              error: String(payload?.msg || "Falha na clonagem."),
            });
            return;
          }

          const persisted = persistCloneResult(db, payload);
          updateJob(db, jobId, {
            status: "succeeded",
            progress: 100,
            message: payload?.msg || "Concluído.",
            juiz_id: persisted.juizId,
            error: null,
          });
        } catch (e) {
          updateJob(db, jobId, {
            status: "failed",
            progress: 100,
            message: "Falha na clonagem.",
            error: String(e?.message || e),
          });
        }
      });

      return res.status(202).json({ jobId, status: "queued" });
    } catch (e) {
      next(e);
    }
  });

  router.get("/jobs/:jobId", async (req, res, next) => {
    try {
      const jobId = (req.params.jobId ?? "").toString().trim();
      if (!jobId) return res.status(400).json({ detail: "jobId é obrigatório." });

      const job = getJob(db, jobId);
      if (!job) return res.status(404).json({ detail: "Job não encontrado." });
      return res.json(job);
    } catch (e) {
      next(e);
    }
  });

  return router;
}

