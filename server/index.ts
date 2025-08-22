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

  // Add cache-control headers for production with deployment-aware caching
  if (app.get("env") === "production") {
    app.use((req, res, next) => {
      // Cache-bust HTML files - always check server for updates
      if (req.path.endsWith('.html') || req.path === '/' || req.path === '/index.html') {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('X-Deployment', new Date().toISOString().slice(0, 10)); // Daily deployment marker
      } 
      // Moderate cache for hashed assets with deployment validation
      else if (/\.(js|css)$/.test(req.path) && /-[a-zA-Z0-9]+\.(js|css)$/.test(req.path)) {
        res.set('Cache-Control', 'public, max-age=86400, must-revalidate'); // 1 day but validate
        res.set('X-Deployment', new Date().toISOString().slice(0, 10));
      }
      // Short-term cache for other static assets
      else if (/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(req.path)) {
        res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes
      }
      next();
    });
  }

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
