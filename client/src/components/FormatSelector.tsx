import React, { useState } from 'react';
import { Video, Music, Check, Download, Sparkles } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export const FormatSelector: React.FC = () => {
  const { mediaInfo, selectedFormat, setSelectedFormat, startDownload, activeProgress } = useMedia();
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  if (!mediaInfo) return null;

  const videoFormats = mediaInfo.formats.filter((f) => f.hasVideo);
  const audioFormats = mediaInfo.formats.filter((f) => !f.hasVideo);

  const displayedFormats = activeTab === 'video' ? videoFormats : audioFormats;

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const isDownloading = Boolean(activeProgress && activeProgress.status !== 'completed' && activeProgress.status !== 'error');

  return (
    <div className="format-container glass-card animate-fade-in">
      <div className="format-header">
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('video');
              if (videoFormats.length > 0) setSelectedFormat(videoFormats[0]);
            }}
          >
            <Video size={16} />
            <span>Video (MP4)</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('audio');
              if (audioFormats.length > 0) setSelectedFormat(audioFormats[0]);
            }}
          >
            <Music size={16} />
            <span>Audio (MP3 / M4A)</span>
          </button>
        </div>

        <button
          type="button"
          className="download-now-btn"
          onClick={startDownload}
          disabled={!selectedFormat || isDownloading}
        >
          <Sparkles size={18} />
          <span>Start Download</span>
          <Download size={18} />
        </button>
      </div>

      <div className="formats-grid">
        {displayedFormats.map((fmt) => {
          const isSelected = selectedFormat?.formatId === fmt.formatId && selectedFormat?.ext === fmt.ext;
          const isHD = fmt.resolution.includes('1080p') || fmt.resolution.includes('4K') || fmt.resolution.includes('2K');
          const sizeStr = formatFileSize(fmt.filesize);

          return (
            <div
              key={`${fmt.formatId}-${fmt.ext}`}
              className={`format-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedFormat(fmt)}
            >
              <div className="format-card-header">
                <span className="resolution-title">{fmt.resolution}</span>
                {isHD && <span className="hd-badge">HD</span>}
              </div>

              <div className="format-card-body">
                <span className="ext-tag">{fmt.ext.toUpperCase()}</span>
                {fmt.note && <span className="note-text">{fmt.note}</span>}
                {sizeStr && <span className="filesize-badge">{sizeStr}</span>}
              </div>

              <div className="check-indicator">
                <Check size={16} />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .format-container {
          padding: 1.75rem;
          margin-bottom: 2rem;
        }

        .format-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .tab-switcher {
          display: flex;
          background: rgba(0, 0, 0, 0.4);
          padding: 0.35rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.55rem 1.25rem;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .tab-btn.active {
          background: var(--gradient-main);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .download-now-btn {
          background: var(--gradient-main);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          padding: 0.75rem 1.75rem;
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        .download-now-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--glow-primary);
        }

        .download-now-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .formats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }

        .format-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .format-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .format-card.selected {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.12);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
        }

        .format-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .resolution-title {
          font-weight: 700;
          font-size: 1.05rem;
          color: white;
        }

        .hd-badge {
          background: var(--gradient-main);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .format-card-body {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .ext-tag {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .note-text {
          font-size: 0.75rem;
          color: var(--text-subtle);
        }

        .filesize-badge {
          margin-left: auto;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-cyan);
        }

        .check-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.5);
          transition: var(--transition-smooth);
        }

        .format-card.selected .check-indicator {
          opacity: 1;
          transform: scale(1);
        }

        @media (max-width: 640px) {
          .format-header {
            flex-direction: column;
            align-items: stretch;
          }
          .download-now-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
