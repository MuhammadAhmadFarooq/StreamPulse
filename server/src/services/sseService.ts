import { Response } from 'express';
import { JobProgress } from '../types/index.js';
import { logger } from '../utils/logger.js';

class SSEService {
  private clients: Map<string, Response> = new Map();

  public registerClient(jobId: string, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    this.clients.set(jobId, res);
    logger.info(`SSE Client connected for jobId: ${jobId}`);

    // Send initial handshake
    this.sendProgress(jobId, {
      jobId,
      percent: 0,
      speed: '0KiB/s',
      eta: '--:--',
      status: 'starting',
    });

    res.on('close', () => {
      this.clients.delete(jobId);
      logger.info(`SSE Client disconnected for jobId: ${jobId}`);
    });
  }

  public sendProgress(jobId: string, progress: JobProgress) {
    const client = this.clients.get(jobId);
    if (client) {
      client.write(`data: ${JSON.stringify(progress)}\n\n`);
    }
  }

  public closeConnection(jobId: string) {
    const client = this.clients.get(jobId);
    if (client) {
      client.end();
      this.clients.delete(jobId);
    }
  }
}

export const sseService = new SSEService();
