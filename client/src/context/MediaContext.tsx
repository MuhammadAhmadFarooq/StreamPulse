import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MediaInfo, FormatOption, DownloadProgress, DownloadHistoryItem } from '../types/media';
import { fetchMediaInfo, requestDownload, subscribeToProgress } from '../services/api';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface MediaContextType {
  url: string;
  setUrl: (url: string) => void;
  mediaInfo: MediaInfo | null;
  isLoadingInfo: boolean;
  selectedFormat: FormatOption | null;
  setSelectedFormat: (format: FormatOption | null) => void;
  activeProgress: DownloadProgress | null;
  history: DownloadHistoryItem[];
  toast: ToastState | null;
  analyzeUrl: (targetUrl?: string) => Promise<void>;
  startDownload: () => Promise<void>;
  resetAll: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearHistory: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

const HISTORY_KEY = 'streampulse_download_history';

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [url, setUrl] = useState<string>('');
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(null);
  const [activeProgress, setActiveProgress] = useState<DownloadProgress | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load download history:', e);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const analyzeUrl = async (targetUrl?: string) => {
    const queryUrl = targetUrl || url;
    if (!queryUrl.trim()) {
      showToast('Please enter a valid media URL first.', 'error');
      return;
    }

    setIsLoadingInfo(true);
    setMediaInfo(null);
    setSelectedFormat(null);
    setActiveProgress(null);

    try {
      const data = await fetchMediaInfo(queryUrl);
      setMediaInfo(data);
      if (data.formats && data.formats.length > 0) {
        setSelectedFormat(data.formats[0]);
      }
      showToast('Media analyzed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze media link.', 'error');
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const startDownload = async () => {
    if (!mediaInfo || !selectedFormat) {
      showToast('Please select a video quality or audio format.', 'error');
      return;
    }

    try {
      const isAudio = !selectedFormat.hasVideo;
      const jobId = await requestDownload({
        url: mediaInfo.url,
        formatId: selectedFormat.formatId,
        type: isAudio ? 'audio' : 'video',
        customFilename: mediaInfo.title,
      });

      setActiveProgress({
        jobId,
        percent: 0,
        speed: '0KiB/s',
        eta: '--:--',
        status: 'starting',
      });

      // Subscribe to real-time SSE updates
      subscribeToProgress(
        jobId,
        (progress) => {
          setActiveProgress(progress);

          if (progress.status === 'completed') {
            // Trigger Confetti Celebration
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#6366f1', '#ec4899', '#8b5cf6', '#06b6d4'],
            });

            // Fetch the file as a blob, then force-download with correct filename.
            // This bypasses Vite proxy header stripping (Content-Disposition is ignored
            // when using programmatic <a> clicks through a proxy). Blob approach always works.
            const cleanTitle = (mediaInfo.title || 'video')
              .replace(/[\\/:*?"<>|]/g, '_')
              .replace(/\s+/g, '_')
              .slice(0, 100);
            const downloadFileName = `${cleanTitle}.${selectedFormat.ext}`;
            const apiUrl = `/api/media/file/${jobId}`;

            fetch(apiUrl)
              .then((res) => {
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                return res.blob();
              })
              .then((blob) => {
                const objectUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = objectUrl;
                link.setAttribute('download', downloadFileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // Revoke after a short delay so browser can start the download
                setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
              })
              .catch((err) => {
                console.error('Blob download failed:', err);
                showToast('Download link ready — click Save in the progress card.', 'info');
              });

            // Add to history
            const historyItem: DownloadHistoryItem = {
              id: Date.now().toString(),
              jobId,
              title: mediaInfo.title,
              uploader: mediaInfo.uploader,
              thumbnail: mediaInfo.thumbnail,
              formatResolution: selectedFormat.resolution,
              ext: selectedFormat.ext,
              downloadDate: new Date().toLocaleDateString(),
              fileSizeFormatted: progress.fileSize ? `${(progress.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Done',
            };

            setHistory((prev) => {
              const updated = [historyItem, ...prev.slice(0, 19)]; // Keep latest 20 items
              localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
              return updated;
            });

            showToast('Download complete! Saving to your downloads folder.', 'success');
          } else if (progress.status === 'error') {
            showToast(progress.error || 'Download failed during conversion.', 'error');
          }
        },
        (errorMsg) => {
          showToast(errorMsg, 'error');
        }
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to start download.', 'error');
    }
  };

  const resetAll = () => {
    setUrl('');
    setMediaInfo(null);
    setSelectedFormat(null);
    setActiveProgress(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    showToast('Download history cleared.', 'info');
  };

  return (
    <MediaContext.Provider
      value={{
        url,
        setUrl,
        mediaInfo,
        isLoadingInfo,
        selectedFormat,
        setSelectedFormat,
        activeProgress,
        history,
        toast,
        analyzeUrl,
        startDownload,
        resetAll,
        showToast,
        clearHistory,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
