import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mediaRoutes from './routes/mediaRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initCleanupTask } from './utils/fileCleanup.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (must be registered BEFORE static frontend middleware)
app.use('/api/media', mediaRoutes);

// Serve static frontend in production
// In Docker: /app/client/dist  |  In local dev: ../client/dist
const clientDist = process.env.CLIENT_DIST_PATH
  ? path.resolve(process.env.CLIENT_DIST_PATH)
  : path.join(process.cwd(), '../client/dist');

if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  logger.info(`Serving static frontend from: ${clientDist}`);

  // Catch-all: serve React SPA index.html for all non-API GET routes
  app.get('*', (req, res) => {
    const indexPath = path.join(clientDist, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend not built.' });
    }
  });
}

// Global Error Handler
app.use(errorHandler);

// Initialize background tasks
initCleanupTask();

app.listen(PORT, () => {
  logger.info(`🚀 Media Downloader Server listening on http://localhost:${PORT}`);
});
