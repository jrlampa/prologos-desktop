import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";

import { openSqlite } from "./db.js";
import { createErrorHandler } from "./middleware/errorHandler.js";
import { createAnaliseRouter } from "./routes/analise.js";
import { createHealthRouter } from "./routes/health.js";
import { createJobsRouter } from "./routes/jobs.js";
import { createJuizesRouter } from "./routes/juizes.js";
import { createMlRouter } from "./routes/ml.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp({
  sqlitePath,
  fastapiBaseUrl,
  groqApiKey,
  groqModel,
  corsOrigins,
  pdfMaxSizeBytes,
  serveFrontend = true,
} = {}) {
  const SQLITE_PATH = sqlitePath || process.env.SQLITE_PATH || path.resolve(__dirname, "..", "..", "backend", "prologos_mvp.db");
  // Em desktop, queremos permitir "desligar" o legado (FastAPI) passando `fastapiBaseUrl: ""`.
  const FASTAPI_BASE_URL = (fastapiBaseUrl ?? process.env.FASTAPI_BASE_URL ?? "").toString().replace(/\/+$/, "");
  const GROQ_API_KEY = groqApiKey ?? process.env.GROQ_API_KEY ?? "";
  const GROQ_MODEL = groqModel ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  const CORS_ORIGINS = (corsOrigins || process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const corsAllowlist = new Set(CORS_ORIGINS);

  const PDF_MAX_SIZE_BYTES = Number(pdfMaxSizeBytes ?? process.env.PDF_MAX_SIZE_BYTES ?? 10 * 1024 * 1024);

  const db = openSqlite(SQLITE_PATH);

  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

  // Observabilidade mínima: requestId + logs estruturados (JSON) sem dependências.
  app.use((req, res, next) => {
    const requestId = (req.headers["x-request-id"] || "").toString().trim() || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      console.log(
        JSON.stringify({
          level,
          msg: "http_request",
          requestId,
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs: Math.round(durationMs * 1000) / 1000,
        }),
      );
    });

    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (corsAllowlist.has(origin)) return cb(null, true);
        const err = new Error("Not allowed by CORS");
        err.statusCode = 403;
        return cb(err);
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "2mb" }));

  const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/analise") || /^\/juiz\/\d+\/dossie$/.test(req.path),
    handler: (_req, res) => res.status(429).json({ detail: "Muitas requisições. Tente novamente mais tarde." }),
  });

  const aiLimiter = rateLimit({
    windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
    max: Number(process.env.AI_RATE_LIMIT_MAX || 30),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ detail: "Muitas requisições em endpoints de IA. Aguarde e tente novamente." }),
  });

  const cloneLimiter = rateLimit({
    windowMs: Number(process.env.CLONE_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000),
    max: Number(process.env.CLONE_RATE_LIMIT_MAX || 20),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ detail: "Muitas requisições de clonagem. Aguarde e tente novamente mais tarde." }),
  });

  app.use("/api", apiLimiter);
  app.use("/api/analise", aiLimiter);
  app.use("/api/juiz/:juizId/dossie", aiLimiter);
  app.use("/api/clonar-juiz", cloneLimiter);

  const uploadPdf = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: PDF_MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      const mime = (file?.mimetype || "").toLowerCase();
      const ok = mime === "application/pdf" || mime === "application/x-pdf" || mime === "application/octet-stream";
      if (ok) return cb(null, true);
      const err = new Error("Tipo de arquivo inválido. Envie um PDF.");
      err.statusCode = 400;
      return cb(err);
    },
  });

  // Healths (inclui /health e /api/health)
  app.use(
    createHealthRouter({
      sqlitePath: SQLITE_PATH,
      fastapiBaseUrl: FASTAPI_BASE_URL,
      corsAllowlist: CORS_ORIGINS,
      pdfMaxSizeBytes: PDF_MAX_SIZE_BYTES,
    }),
  );

  // Frontend dist (produção)
  const frontendDist = path.resolve(__dirname, "..", "..", "frontend", "dist");
  const indexHtml = path.join(frontendDist, "index.html");
  const hasFrontendBuild = fs.existsSync(indexHtml);

  if (serveFrontend && hasFrontendBuild) {
    app.use(express.static(frontendDist));
  }

  // Rotas /api
  app.use("/api", createJuizesRouter({ db, groqApiKey: GROQ_API_KEY, groqModel: GROQ_MODEL }));
  app.use(
    "/api",
    createAnaliseRouter({
      db,
      upload: uploadPdf,
      groqApiKey: GROQ_API_KEY,
      groqModel: GROQ_MODEL,
      fastapiBaseUrl: FASTAPI_BASE_URL,
    }),
  );
  app.use("/api", createJobsRouter({ db, fastapiBaseUrl: FASTAPI_BASE_URL }));
  app.use("/api", createMlRouter());

  // SPA fallback (se build existir)
  if (serveFrontend && hasFrontendBuild) {
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(indexHtml);
    });
  }

  // Handler de erros
  app.use(createErrorHandler({ pdfMaxSizeBytes: PDF_MAX_SIZE_BYTES }));

  return { app, db, config: { SQLITE_PATH, FASTAPI_BASE_URL } };
}

