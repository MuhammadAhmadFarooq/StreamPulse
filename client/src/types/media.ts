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

export interface DownloadProgress {
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

export interface DownloadHistoryItem {
  id: string;
  jobId: string;
  title: string;
  uploader: string;
  thumbnail: string;
  formatResolution: string;
  ext: string;
  downloadDate: string;
  fileSizeFormatted: string;
}
