import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { StartupManager } from "./services/startupManager";

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
  console.log("🚀 Starting AIForecast Hub (Professional Edition) - DEPLOYMENT FIX v1.0.1");
  console.log("🔧 DEPLOYMENT: Fixed port, caching, and build process");
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}, Port: ${parseInt(process.env.PORT || '3000', 10)}`);
  
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

  // 🔧 DEPLOYMENT: ULTRA-AGGRESSIVE anti-caching to bypass Caddy
  app.use((req, res, next) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36);
    
    // Prevent ALL caching - ULTRA AGGRESSIVE
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '-1');
    res.setHeader('Surrogate-Control', 'no-store, max-age=0');
    res.setHeader('X-Accel-Expires', '0');
    
    // Force revalidation
    res.setHeader('Vary', '*');
    res.setHeader('Last-Modified', new Date().toUTCString());
    
    // ETag prevention - make every response unique
    res.setHeader('ETag', `"NOCACHE-${timestamp}-${random}"`);
    
    // Caddy-specific headers to force bypass
    res.setHeader('X-Cache-Status', 'MISS');
    res.setHeader('X-Cache-Control', 'BYPASS');
    res.setHeader('X-No-Cache', 'FORCE');
    
    // Deployment fingerprint
    res.setHeader('X-Deployment-Fix', `v1.0.2-${timestamp}`);
    res.setHeader('X-Cache-Buster', `${timestamp}-${random}`);
    res.setHeader('X-Timestamp', timestamp.toString());
    
    next();
  });

  // Setup Vite or static serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
    console.log("✅ Static file serving configured for production");
  }

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
