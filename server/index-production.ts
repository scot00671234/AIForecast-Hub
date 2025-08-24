// Clean Production Server - Fixed path resolution
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { StartupManager } from "./services/startupManager";
import path from "path";
import fs from "fs";

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

function serveStatic(app: express.Express) {
  // Fixed path resolution for production
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
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
  console.log("🚀 AIForecast Hub Production - Path Fix v1.0.4");
  console.log("✅ FIXED: path.resolve undefined error in production");
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'production'}, Port: ${parseInt(process.env.PORT || '5000', 10)}`);
  
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

  // Setup static file serving for production
  serveStatic(app);
  console.log("✅ Static file serving configured (fixed path resolution)");
  console.log(`📁 Serving frontend from: ${path.resolve(process.cwd(), "dist", "public")}`);

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Server running on port ${port}`);
    console.log("🎯 Production server ready - frontend updates will now work!");
    
    // Phase 3: Heavy initialization (background, non-blocking)
    startupManager.initializeHeavy().catch(error => {
      console.error("⚠️ Background initialization failed (non-critical):", error);
    });
  });
})();