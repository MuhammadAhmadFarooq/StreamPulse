export interface FormatOption {
  formatId: string;
  resolution: string;
  ext: string;
  filesize: number | null;
  hasVideo: boolean;
  hasAudio: boolean;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  note?: string;
}

export interface MediaInfo {
  id: string;
  title: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string;
  uploader: string;
  url: string;
  formats: FormatOption[];
}

export interface DownloadRequest {
  url: string;
  formatId: string;
  type: 'video' | 'audio';
  audioQuality?: string;
  customFilename?: string;
}

export interface JobProgress {
  jobId: string;
  percent: number;
  speed: string;
  eta: string;
  status: 'starting' | 'downloading' | 'processing' | 'completed' | 'error';
  error?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
}
