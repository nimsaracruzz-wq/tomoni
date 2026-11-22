import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3005";
const configuredDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localDevOrigins = Object.values(networkInterfaces())
  .flat()
  .filter((network) => network?.family === "IPv4" && !network.internal)
  .map((network) => network!.address);
const DEV_ORIGINS = [...new Set([...configuredDevOrigins, ...localDevOrigins])];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["localhost", "127.0.0.1", ...DEV_ORIGINS],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    // Exclude the SQLite data directory from Turbopack's file watcher.
    // Without this, Tailwind v4's PostCSS glob scan tries to read
    // tomoni.sqlite-shm which is locked by the backend, causing a panic.
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json", ".css"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/admin",
        destination: `${BACKEND_URL}/admin`,
      },
      {
        source: "/admin/:path*",
        destination: `${BACKEND_URL}/admin/:path*`,
      },
      {
        source: "/unsubscribe",
        destination: `${BACKEND_URL}/unsubscribe`,
      },
    ];
  },
};

export default nextConfig;
