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

// Serve static frontend in production if built
const clientDist = path.join(process.cwd(), '../client/dist');
app.use(express.static(clientDist));

// API Routes
app.use('/api/media', mediaRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

// Initialize background tasks
initCleanupTask();

app.listen(PORT, () => {
  logger.info(`🚀 Media Downloader Server listening on http://localhost:${PORT}`);
});
