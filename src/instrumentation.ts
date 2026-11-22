export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { startBackendServer } = await import("./backend-launcher.mjs");
      await startBackendServer();
    } catch (err) {
      console.error("[Instrumentation] Error initializing backend server:", err);
    }
  }
}
