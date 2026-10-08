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
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production" && hasDist;

  // Vite middleware for local development
  if (!isProduction) {
    // Intercept /@vite/client so browser does not attempt failing WebSocket HMR in the iframe preview
    app.get("/@vite/client", (_req, res) => {
      res.type("application/javascript").send(`
        const sheetsMap = new Map();
        export function updateStyle(id, content) {
          try {
            let style = sheetsMap.get(id);
            if (!style) {
              style = document.createElement("style");
              style.setAttribute("type", "text/css");
              style.setAttribute("data-vite-dev-id", id);
              style.textContent = content;
              document.head.appendChild(style);
            } else {
              style.textContent = content;
            }
            sheetsMap.set(id, style);
          } catch (_) {}
        }
        export function removeStyle(id) {
          try {
            const style = sheetsMap.get(id);
            if (style) {
              style.remove();
              sheetsMap.delete(id);
            }
          } catch (_) {}
        }
        export function injectQuery(url, query) {
          return url + (url.includes("?") ? "&" : "?") + query;
        }
        export function createHotContext() {
          return {
            accept() {},
            dispose() {},
            prune() {},
            invalidate() {},
            decline() {},
            on() {},
            off() {},
            send() {},
          };
        }
        export class ErrorOverlay extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {}
      `);
    });

    const { createServer: createViteServer, createLogger } = await import("vite");
    const customLogger = createLogger("silent");
    const filterMsg = (msg: unknown) => {
      const str = typeof msg === "string" ? msg : String(msg ?? "");
      return str.includes("[vite]") || str.toLowerCase().includes("websocket") || str.toLowerCase().includes("hmr");
    };
    const origError = customLogger.error.bind(customLogger);
    const origWarn = customLogger.warn.bind(customLogger);
    const origInfo = customLogger.info.bind(customLogger);
    customLogger.error = (msg, options) => {
      if (filterMsg(msg)) return;
      origError(msg, options);
    };
    customLogger.warn = (msg, options) => {
      if (filterMsg(msg)) return;
      origWarn(msg, options);
    };
    customLogger.info = (msg, options) => {
      if (filterMsg(msg)) return;
      origInfo(msg, options);
    };
    customLogger.warnOnce = (msg, options) => {
      if (filterMsg(msg)) return;
      origWarn(msg, options);
    };

    const vite = await createViteServer({
      customLogger,
      logLevel: "silent",
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
