import { spawn } from 'child_process';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';
import { MediaInfo, FormatOption, DownloadRequest } from '../types/index.js';
import { sseService } from './sseService.js';
import { sanitizeFilename, formatDuration } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

// Auto-detect system or bundled yt-dlp binary (Docker/Linux & Windows)
function getYtdlExecBinary(): string {
  if (fs.existsSync('/usr/local/bin/yt-dlp')) {
    return '/usr/local/bin/yt-dlp';
  }
  if (fs.existsSync('/usr/bin/yt-dlp')) {
    return '/usr/bin/yt-dlp';
  }
  const bundledNode = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp');
  const bundledNodeExe = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe');
  if (fs.existsSync(bundledNode)) return bundledNode;
  if (fs.existsSync(bundledNodeExe)) return bundledNodeExe;
  return 'yt-dlp';
}

// Auto-detect system or installer ffmpeg binary
function getFfmpegBinaryPath(): string {
  if (fs.existsSync('/usr/bin/ffmpeg')) {
    return '/usr/bin/ffmpeg';
  }
  if (fs.existsSync('/usr/local/bin/ffmpeg')) {
    return '/usr/local/bin/ffmpeg';
  }
  return ffmpegPath.path;
}

// Ensure optional cookies file from environment variable if provided on Render/Fly
function getCookieFlags(): string[] {
  const cookiesContent = process.env.YOUTUBE_COOKIES_TEXT;
  if (!cookiesContent || !cookiesContent.trim()) return [];

  const cookiePath = path.join(process.cwd(), 'youtube_cookies.txt');
  try {
    fs.writeFileSync(cookiePath, cookiesContent.trim(), 'utf-8');
    return ['--cookies', cookiePath];
  } catch (err) {
    logger.error('Failed to write cookies file:', err);
    return [];
  }
}

// Cloud server bypass flags: tvhtml5 + android_vr player clients bypass bot sign-in checks
const COMMON_FLAGS = [
  '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  '--referer', 'https://www.youtube.com/',
  '--add-header', 'Accept-Language:en-US,en;q=0.9',
  '--extractor-args', 'youtube:player_client=tvhtml5,android_vr,mweb',
  '--no-check-certificates',
  '--geo-bypass',
];

export class YtdlService {

  // ── GET METADATA ──────────────────────────────────────────────────────────────
  public async getMediaInfo(url: string): Promise<MediaInfo> {
    const bin = getYtdlExecBinary();
    logger.info(`Extracting media info for URL: ${url} using binary: ${bin}`);

    const args = [
      url,
      '--dump-single-json',
      '--no-warnings',
      '--no-playlist',
      '--ffmpeg-location', getFfmpegBinaryPath(),
      ...COMMON_FLAGS,
      ...getCookieFlags(),
    ];

    const raw: any = await new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      const proc = spawn(bin, args);

      proc.stdout?.on('data', (c: Buffer) => { stdout += c.toString(); });
      proc.stderr?.on('data', (c: Buffer) => { stderr += c.toString(); });

      proc.on('close', (code: number) => {
        if (code !== 0) {
          logger.error(`yt-dlp info exit ${code}: ${stderr.slice(0, 400)}`);
          const errLine = stderr.split('\n').find((l) => l.includes('ERROR:')) || stderr.slice(0, 200);
          return reject(new Error(errLine.replace(/^ERROR:\s*/, '').trim() || 'Could not fetch metadata. Video may be private or geo-blocked.'));
        }
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch (e: any) {
          logger.error('JSON parse error from yt-dlp:', e.message);
          reject(new Error('Invalid JSON output from yt-dlp.'));
        }
      });

      proc.on('error', (err: Error) => {
        logger.error(`yt-dlp spawn error: ${err.message}`);
        reject(err);
      });
    });

    const rawFormats: any[] = raw.formats || [];

    // Heights that have real video streams
    const videoHeights = Array.from(
      new Set<number>(
        rawFormats
          .filter((f: any) => f.height && f.vcodec && f.vcodec !== 'none')
          .map((f: any) => f.height as number)
      )
    ).sort((a, b) => b - a);

    logger.info(`Available video heights: ${videoHeights.join(', ')}`);

    const formats: FormatOption[] = [];

    videoHeights.forEach((height) => {
      let label: string;
      if      (height >= 2160) label = '2160p (4K)';
      else if (height >= 1440) label = '1440p (2K)';
      else if (height >= 1080) label = '1080p (Full HD)';
      else if (height >= 720)  label = '720p (HD)';
      else if (height >= 480)  label = '480p';
      else if (height >= 360)  label = '360p';
      else if (height >= 240)  label = '240p';
      else                     label = '144p';

      if (formats.some((f) => f.resolution === label)) return;

      const formatId =
        `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]` +
        `/bestvideo[height<=${height}]+bestaudio` +
        `/best[height<=${height}]`;

      const sample = rawFormats.find(
        (f: any) => f.height === height && f.vcodec !== 'none'
      );

      formats.push({
        formatId,
        resolution: label,
        ext: 'mp4',
        filesize: sample?.filesize || sample?.filesize_approx || null,
        hasVideo: true,
        hasAudio: true,
        note: `${label} MP4 — video + best audio merged`,
      });
    });

    if (formats.length === 0) {
      formats.push({
        formatId: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
        resolution: 'Best Available',
        ext: 'mp4',
        filesize: null,
        hasVideo: true,
        hasAudio: true,
        note: 'Best available quality',
      });
    }

    // Audio-only
    formats.push(
      {
        formatId: 'bestaudio/best',
        resolution: 'MP3 Audio (Best)',
        ext: 'mp3',
        filesize: null,
        hasVideo: false,
        hasAudio: true,
        note: 'Audio extracted to MP3',
      },
      {
        formatId: 'bestaudio[ext=m4a]/bestaudio/best',
        resolution: 'M4A Audio (AAC)',
        ext: 'm4a',
        filesize: null,
        hasVideo: false,
        hasAudio: true,
        note: 'Native AAC stream',
      }
    );

    return {
      id: raw.id || 'video',
      title: raw.title || 'Untitled Media',
      duration: raw.duration || 0,
      durationFormatted: formatDuration(raw.duration || 0),
      thumbnail:
        raw.thumbnail ||
        (raw.thumbnails?.length ? raw.thumbnails[raw.thumbnails.length - 1].url : ''),
      uploader: raw.uploader || raw.channel || 'Unknown Channel',
      url,
      formats,
    };
  }

  // ── START DOWNLOAD ─────────────────────────────────────────────────────────────
  public async startDownload(
    jobId: string,
    request: DownloadRequest
  ): Promise<{ filePath: string; fileName: string }> {
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
    }

    const { url, formatId, type, customFilename } = request;

    const AUDIO_FORMAT_IDS = [
      'bestaudio/best',
      'bestaudio[ext=m4a]/bestaudio/best',
    ];
    const isAudio =
      type === 'audio' ||
      AUDIO_FORMAT_IDS.includes(formatId) ||
      (formatId.startsWith('bestaudio') && !formatId.includes('bestvideo'));

    const extension = isAudio
      ? (formatId.includes('m4a') ? 'm4a' : 'mp3')
      : 'mp4';

    const safeTitle = sanitizeFilename(customFilename || jobId);
    const outputPattern = path.join(DOWNLOADS_DIR, `${safeTitle}_${jobId}.%(ext)s`);

    const bin = getYtdlExecBinary();
    logger.info(`Starting download job ${jobId} [${extension.toUpperCase()}] binary: ${bin}`);

    return new Promise((resolve, reject) => {
      const args = [
        url,
        '--format', formatId,
        '--output', outputPattern,
        '--ffmpeg-location', getFfmpegBinaryPath(),
        '--no-warnings',
        '--no-playlist',
        '--newline',
        ...COMMON_FLAGS,
        ...getCookieFlags(),
      ];

      if (isAudio) {
        args.push('--extract-audio', '--audio-format', extension, '--audio-quality', '0');
      } else {
        args.push('--merge-output-format', 'mp4');
        args.push('--postprocessor-args', 'ffmpeg:-c:v copy -c:a aac -b:a 192k');
      }

      const proc = spawn(bin, args);
      let lastErrorMsg = '';

      proc.stdout?.on('data', (chunk: Buffer) => {
        const line = chunk.toString();
        const m = line.match(
          /\[download\]\s+([\d.]+)%\s+of\s+~?\s*\S+\s+at\s+(\S+)\s+ETA\s+(\S+)/i
        );
        if (m) {
          sseService.sendProgress(jobId, {
            jobId,
            percent: parseFloat(m[1]),
            speed: m[2],
            eta: m[3],
            status: 'downloading',
          });
        } else if (
          line.includes('[Merger]') ||
          line.includes('[ffmpeg]') ||
          line.includes('[ExtractAudio]') ||
          line.includes('[VideoConvertor]')
        ) {
          sseService.sendProgress(jobId, {
            jobId, percent: 99, speed: 'Merging…', eta: '00:01', status: 'processing',
          });
        }
      });

      proc.stderr?.on('data', (chunk: Buffer) => {
        const t = chunk.toString();
        lastErrorMsg += t;
        logger.debug(`[${jobId}] stderr: ${t.trim()}`);
      });

      proc.on('close', (code: number) => {
        if (code !== 0) {
          logger.error(`Job ${jobId} failed (exit ${code}): ${lastErrorMsg.slice(0, 400)}`);
          sseService.sendProgress(jobId, {
            jobId, percent: 0, speed: '0KiB/s', eta: '--:--',
            status: 'error',
            error: lastErrorMsg || 'Download or merge failed.',
          });
          return reject(new Error('Download failed.'));
        }

        const files = fs.readdirSync(DOWNLOADS_DIR);
        const done = files.find(
          (f) =>
            f.includes(jobId) &&
            !f.endsWith('.part') &&
            !f.endsWith('.ytdl') &&
            !f.endsWith('.temp')
        );

        if (!done) {
          const msg = 'Output file not found after download.';
          logger.error(msg);
          sseService.sendProgress(jobId, {
            jobId, percent: 0, speed: '0KiB/s', eta: '--:--',
            status: 'error', error: msg,
          });
          return reject(new Error(msg));
        }

        const p = path.join(DOWNLOADS_DIR, done);
        const stats = fs.statSync(p);
        logger.info(`Job ${jobId} ✓ → ${done} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        sseService.sendProgress(jobId, {
          jobId,
          percent: 100,
          speed: 'Complete',
          eta: '00:00',
          status: 'completed',
          filePath: p,
          fileName: done,
          fileSize: stats.size,
        });
        resolve({ filePath: p, fileName: done });
      });

      proc.on('error', (err: Error) => {
        logger.error(`Process error job ${jobId}: ${err.message}`);
        sseService.sendProgress(jobId, {
          jobId, percent: 0, speed: '0KiB/s', eta: '--:--',
          status: 'error', error: err.message,
        });
        reject(err);
      });
    });
  }
}

export const ytdlService = new YtdlService();
