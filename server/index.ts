import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import dotenv from "dotenv";

// Load environment variables from .env file BEFORE any other imports that use them
dotenv.config();

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { exec } from "child_process";
import { passport } from "./googleAuth";

const app = express();
// Replit Auth enabled
// Increase payload size limit for image uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Configure session middleware (required for passport and fallback auth)
app.use(session({
  secret: process.env.SESSION_SECRET || "healthy-mama-session-secret-2025",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for better persistence
    sameSite: 'lax' // Helps with CSRF protection
  },
  name: 'healthy-mama-session', // Custom session name
  rolling: true // Reset expiry on activity
}));

app.use(passport.initialize());
app.use(passport.session());

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT env variable or default to 5000
  // this serves both the API and the client.
  // In Replit, port 5000 is the only port that is not firewalled.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Exiting...`);
      process.exit(1);
    } else {
      log(`Server error: ${error.message}`);
      throw error;
    }
  });
  
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    
    // Log API key status
    console.log("🔑 API Keys Status:");
    console.log(`   - Instacart: ${process.env.INSTACART_API_KEY ? '✅ Available' : '❌ Not found'}`);
    console.log(`   - YouTube: ${process.env.YOUTUBE_API_KEY ? '✅ Available' : '❌ Not found'}`);
    console.log(`   - OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Available' : '❌ Not found'}`);
  });
})();
