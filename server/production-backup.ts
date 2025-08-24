import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { StartupManager } from "./services/startupManager";
import path from "path";
import fs from "fs";

// Simple log function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("🚀 Starting AIForecast Hub (Professional Edition) - PRODUCTION v1.0.1");
  console.log("🔧 PRODUCTION: Clean production build without vite dependencies");
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'production'}, Port: ${parseInt(process.env.PORT || '3000', 10)}`);
  
  // Initialize startup manager
  const startupManager = new StartupManager(storage);
  
  try {
    // Phase 1: Critical startup (must succeed)
    await startupManager.initializeCritical();
    console.log("✅ Critical initialization complete");
  } catch (error) {
    console.error("❌ Critical startup failed:", error);
    process.exit(1);
  }
  
  // Phase 2: Register routes and setup server
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Production static serving - no vite dependencies
  const distPath = path.resolve(process.cwd(), "dist", "public");
  console.log(`📁 Looking for frontend files at: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    throw new Error(`Frontend build not found at: ${distPath}`);
  }
  
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
  console.log("✅ Production static file serving configured");

  // Start server
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Server running on port ${port}`);
    console.log("🎯 Application ready - all systems operational");
    
    // Phase 3: Heavy initialization (background, non-blocking)
    startupManager.initializeHeavy().catch(error => {
      console.error("⚠️ Background initialization failed (non-critical):", error);
    });
  });
})();