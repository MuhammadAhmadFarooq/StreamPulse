import { MediaInfo, DownloadProgress } from '../types/media';

export async function fetchMediaInfo(url: string): Promise<MediaInfo> {
  const response = await fetch('/api/media/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch media information.');
  }

  return json.data;
}

export async function requestDownload(payload: {
  url: string;
  formatId: string;
  type: 'video' | 'audio';
  customFilename?: string;
}): Promise<string> {
  const response = await fetch('/api/media/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to initiate download job.');
  }

  return json.jobId;
}

export function subscribeToProgress(
  jobId: string,
  onProgress: (progress: DownloadProgress) => void,
  onError: (error: string) => void
): () => void {
  const eventSource = new EventSource(`/api/media/progress/${jobId}`);

  eventSource.onmessage = (event) => {
    try {
      const data: DownloadProgress = JSON.parse(event.data);
      onProgress(data);

      if (data.status === 'completed' || data.status === 'error') {
        eventSource.close();
      }
    } catch (err) {
      console.error('Error parsing SSE data:', err);
    }
  };

  eventSource.onerror = () => {
    onError('Progress stream lost connection.');
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}

export function getFileDownloadUrl(jobId: string, fileName?: string): string {
  if (fileName) {
    const clean = fileName.replace(/["'\\/?:*"><|;,()]/g, '_').replace(/\s+/g, '_');
    return `/api/media/file/${jobId}/${encodeURIComponent(clean)}`;
  }
  return `/api/media/file/${jobId}.mp4`;
}
