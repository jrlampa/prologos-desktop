import { app, BrowserWindow } from "electron";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

// Importa o servidor embeddable (será implementado na Fase 2 do plano).
import { startServer } from "../../server/src/desktopServer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findFreePort(start = 3210, end = 3299) {
  for (let port = start; port <= end; port += 1) {
    const ok = await new Promise((resolve) => {
      const srv = net.createServer();
      srv.once("error", () => resolve(false));
      srv.once("listening", () => srv.close(() => resolve(true)));
      srv.listen(port, "127.0.0.1");
    });
    if (ok) return port;
  }
  throw new Error("Nenhuma porta livre encontrada para o servidor local.");
}

function getResourceDbPath() {
  // Em dev: o arquivo está em ../backend/prologos_mvp.db relativo ao repo.
  // Em prod: electron-builder coloca extraResources em process.resourcesPath.
  const candidateProd = path.join(process.resourcesPath, "prologos_mvp.db");
  if (fs.existsSync(candidateProd)) return candidateProd;
  return path.resolve(__dirname, "..", "..", "..", "backend", "prologos_mvp.db");
}

function ensureUserDb() {
  const userDb = path.join(app.getPath("userData"), "prologos_mvp.db");
  if (fs.existsSync(userDb)) return userDb;
  fs.mkdirSync(path.dirname(userDb), { recursive: true });
  fs.copyFileSync(getResourceDbPath(), userDb);
  return userDb;
}

async function createWindow(serverPort) {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  await win.loadURL(`http://127.0.0.1:${serverPort}/`);
}

let serverHandle = null;

app.whenReady().then(async () => {
  const port = await findFreePort();
  const dbPath = ensureUserDb();

  serverHandle = await startServer({
    host: "127.0.0.1",
    port,
    sqlitePath: dbPath,
  });

  await createWindow(port);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
  });
});

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    try {
      await serverHandle?.stop?.();
    } catch {
      // ignore
    }
    app.quit();
  }
});

