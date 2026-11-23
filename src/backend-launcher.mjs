import { createServer } from "../server.mjs";
import path from "node:path";

let serverInstance = null;

export async function startBackendServer() {
  if (serverInstance) {
    return serverInstance;
  }

  const port = Number(process.env.BACKEND_PORT) || 3005;
  const host = "127.0.0.1";

  try {
    const server = createServer({
      dataDir: path.resolve(process.cwd(), "data"),
      dbPath: path.resolve(process.cwd(), "data/tomoni.sqlite"),
      baseUrl: process.env.PUBLIC_URL || "http://127.0.0.1:3000",
      production: process.env.NODE_ENV === "production",
      encryptionKey: process.env.SMTP_ENCRYPTION_KEY,
      allowSend: process.env.ALLOW_EMAIL_SEND === "true",
    });

    await new Promise((resolve, reject) => {
      server.listen(port, host, () => {
        console.log(`[Tomoni Backend] SQLite registration & admin server active on http://${host}:${port}`);
        serverInstance = server;
        resolve(server);
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log(`[Tomoni Backend] Port ${port} is already in use, reusing existing backend instance.`);
          resolve(null);
        } else {
          console.error("[Tomoni Backend] Error starting backend server:", err);
          reject(err);
        }
      });
    });

    return serverInstance;
  } catch (error) {
    console.error("[Tomoni Backend] Failed to start backend server:", error);
    return null;
  }
}

