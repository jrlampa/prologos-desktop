import { createApp } from "./app.js";

export async function startServer({ host = "127.0.0.1", port = 3210, sqlitePath } = {}) {
  const { app } = createApp({
    sqlitePath,
    // No desktop, não precisamos permitir origens externas
    corsOrigins: `http://127.0.0.1:${port}`,
    // Desliga o legado FastAPI por padrão (desktop all-in-one)
    fastapiBaseUrl: "",
  });

  const server = await new Promise((resolve, reject) => {
    const s = app.listen(port, host, () => resolve(s));
    s.on("error", reject);
  });

  return {
    host,
    port,
    stop: () =>
      new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

