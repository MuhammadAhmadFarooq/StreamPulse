import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

export function initCleanupTask() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  // Cleanup files older than 30 minutes every 10 minutes
  setInterval(() => {
    try {
      const files = fs.readdirSync(DOWNLOADS_DIR);
      const now = Date.now();
      const MAX_AGE = 30 * 60 * 1000; // 30 minutes

      files.forEach((file) => {
        const filePath = path.join(DOWNLOADS_DIR, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > MAX_AGE) {
          fs.unlinkSync(filePath);
          logger.info(`Cleaned up expired file: ${file}`);
        }
      });
    } catch (err) {
      logger.error('Error during scheduled file cleanup:', err);
    }
  }, 10 * 60 * 1000);
}

export function cleanupFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Cleaned up file: ${filePath}`);
    }
  } catch (err) {
    logger.error(`Failed to cleanup file ${filePath}:`, err);
  }
}
