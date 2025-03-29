import express from 'express';
import { registerRoutes } from './routes';
import { serveStatic } from './vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message: string, source = 'express') {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  let capturedJsonResponse: any = undefined;
  const originalResJson = res.json;
  res.json = function(bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }
      log(logLine);
    }
  });

  next();
});

// Main function to bootstrap the app
(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    throw err;
  });

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    log('Running in production mode');
    
    const distPath = path.resolve(__dirname, '../dist/public');
    if (!fs.existsSync(distPath)) {
      throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }
    
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 5000;
  server.listen({ 
    port,
    host: '0.0.0.0',
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

export default app;