import { Router } from 'express';
import { mediaController } from '../controllers/mediaController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/info', apiLimiter, mediaController.getInfo);
router.post('/download', apiLimiter, mediaController.startDownload);
router.get('/progress/:jobId', mediaController.streamProgress);

// Support both direct jobId with extension and explicit filename path for browser download managers
router.get('/file/:jobId', mediaController.downloadFile);
router.get('/file/:jobId/:filename', mediaController.downloadFile);

export default router;
