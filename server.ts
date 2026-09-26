// Prevent '.' from leaking as __dirname into ESM packages that check `typeof __dirname !== 'undefined'`
if ((globalThis as { __dirname?: string }).__dirname === '.') {
  delete (globalThis as { __dirname?: string }).__dirname;
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory crowd reports store
  const liveCrowdReports: Record<string, { pandalId: string; intensity: string; timestamp: number; reportCount: number }> = {};

  // API health route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Hoppers – Durga Puja Companion", offlineReady: true });
  });

  // Pandal locations and offline festival metadata endpoint
  app.get("/api/pandals", async (_req, res) => {
    try {
      const mockData = await import("./src/data/mockData.ts");
      res.json({
        total: mockData.PANDALS_DATA.length,
        pandals: mockData.PANDALS_DATA,
        metroStations: mockData.METRO_STATIONS,
        facilities: mockData.CRITICAL_FACILITIES,
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

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
