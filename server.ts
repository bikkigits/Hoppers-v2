// Prevent '.' from leaking as __dirname into ESM packages that check `typeof __dirname !== 'undefined'`
if ((globalThis as { __dirname?: string }).__dirname === '.') {
  delete (globalThis as { __dirname?: string }).__dirname;
}

import express from "express";
import path from "path";
import fs from "fs";
import { PANDALS_DATA, METRO_STATIONS, CRITICAL_FACILITIES } from "./src/data/mockData";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // In-memory crowd reports store
  const liveCrowdReports: Record<string, { pandalId: string; intensity: string; timestamp: number; reportCount: number }> = {};

  // API health route for container readiness & liveness probes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Hoppers – Durga Puja Companion", offlineReady: true });
  });

  // Pandal locations and offline festival metadata endpoint
  app.get("/api/pandals", (_req, res) => {
    try {
      res.json({
        total: PANDALS_DATA.length,
        pandals: PANDALS_DATA,
        metroStations: METRO_STATIONS,
        facilities: CRITICAL_FACILITIES,
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to load pandal metadata" });
    }
  });

  // Crowd reports sync endpoint
  app.get("/api/crowd-reports", (_req, res) => {
    res.json(liveCrowdReports);
  });

  app.post("/api/crowd-reports", (req, res) => {
    const { pandalId, intensity, timestamp, reportCount } = req.body;
    if (!pandalId || !intensity) {
      return res.status(400).json({ error: "Missing pandalId or intensity" });
    }
    const existing = liveCrowdReports[pandalId];
    liveCrowdReports[pandalId] = {
      pandalId,
      intensity,
      timestamp: timestamp || Date.now(),
      reportCount: reportCount || (existing ? existing.reportCount + 1 : 1),
    };
    return res.json({ success: true, report: liveCrowdReports[pandalId] });
  });

  const distPath = path.resolve(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"));

  // Vite middleware for local development ONLY when dist build is absent and not in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static asset serving
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
