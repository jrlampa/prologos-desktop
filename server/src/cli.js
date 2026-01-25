import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env da raiz (útil em dev/local). Em prod, use variáveis de ambiente.
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });
dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";

const { app } = createApp();
app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`[prologos-server] listening on http://${HOST}:${PORT}`);
});

