import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { ytdlService } from '../services/ytdlService.js';
import { sseService } from '../services/sseService.js';
import { isValidUrl } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

export const mediaController = {
  // GET MEDIA INFO
  getInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.body;

      if (!url || !isValidUrl(url)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid media URL (http/https).',
        });
      }

      const mediaInfo = await ytdlService.getMediaInfo(url);
      return res.status(200).json({
        success: true,
        data: mediaInfo,
      });
    } catch (err: any) {
      next(err);
    }
  },

  // START DOWNLOAD JOB
  startDownload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, formatId, type, customFilename } = req.body;

      if (!url || !isValidUrl(url)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid media URL.',
        });
      }

      if (!formatId) {
        return res.status(400).json({
          success: false,
          error: 'Please select a format or quality option.',
        });
      }

      const jobId = `job_${Date.now()}_${uuidv4().substring(0, 8)}`;

      res.status(200).json({
        success: true,
        jobId,
      });

      ytdlService
        .startDownload(jobId, {
          url,
          formatId,
          type: type || 'video',
          customFilename,
        })
        .catch((err) => {
          logger.error(`Async download failed for job ${jobId}:`, err);
        });
    } catch (err) {
      next(err);
    }
  },

  // SSE STREAM PROGRESS
  streamProgress: (req: Request, res: Response) => {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).send('Job ID required');
    }
    sseService.registerClient(jobId, res);
  },

  // DOWNLOAD COMPLETED FILE
  downloadFile: (req: Request, res: Response) => {
    let { jobId } = req.params;

    // Handle case where jobId in route includes extension (.mp4 / .mp3)
    if (jobId.includes('.')) {
      jobId = jobId.split('.')[0];
    }

    if (!fs.existsSync(DOWNLOADS_DIR)) {
      return res.status(404).send('Downloads directory does not exist.');
    }

    const files = fs.readdirSync(DOWNLOADS_DIR);
    const targetFile = files.find(
      (f) => f.includes(jobId) && !f.endsWith('.part') && !f.endsWith('.ytdl')
    );

    if (!targetFile) {
      logger.error(`Download requested for job ${jobId} but no completed file was found.`);
      return res.status(404).send('File not found or still processing.');
    }

    const filePath = path.join(DOWNLOADS_DIR, targetFile);

    // Format clean attachment filename: "Rick_Astley_Never_Gonna_Give_You_Up.mp4"
    const ext = path.extname(targetFile); // e.g. .mp4 or .mp3
    const baseName = path.basename(targetFile, ext);
    const cleanBase = baseName.replace(new RegExp(`_${jobId}$`, 'g'), '');
    const cleanFileName = `${cleanBase}${ext}`;

    const asciiName = cleanFileName.replace(/[^\x20-\x7E]/g, '_').replace(/["',;]/g, '');
    const encodedName = encodeURIComponent(cleanFileName);

    const contentType = ext === '.mp3' ? 'audio/mpeg' : ext === '.m4a' ? 'audio/mp4' : 'video/mp4';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Error streaming file attachment ${targetFile}:`, err);
      }
    });
  },
};
