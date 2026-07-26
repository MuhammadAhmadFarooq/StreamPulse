import React, { useState } from 'react';
import { History, Trash2, FileDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { getFileDownloadUrl } from '../services/api';

export const DownloadHistory: React.FC = () => {
  const { history, clearHistory } = useMedia();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (history.length === 0) return null;

  return (
    <div className="history-container glass-card animate-fade-in">
      <div className="history-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="history-title-group">
          <History size={20} className="history-icon" />
          <h3 className="history-title">Recent Downloads ({history.length})</h3>
        </div>

        <div className="history-controls">
          <button
            type="button"
            className="clear-btn"
            onClick={(e) => {
              e.stopPropagation();
              clearHistory();
            }}
            title="Clear download history"
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
          <button type="button" className="toggle-btn">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <img
                src={item.thumbnail || 'https://via.placeholder.com/120x68'}
                alt={item.title}
                className="history-thumb"
              />

              <div className="history-meta">
                <h4 className="history-item-title" title={item.title}>
                  {item.title}
                </h4>
                <div className="history-sub">
                  <span>{item.uploader}</span> • <span>{item.formatResolution}</span> • <span>{item.fileSizeFormatted}</span>
                </div>
              </div>

              <a
                href={getFileDownloadUrl(item.jobId, `${item.title}.${item.ext}`)}
                download={`${item.title}.${item.ext}`}
                className="history-redownload"
                title="Download file again"
              >
                <FileDown size={16} />
                <span>Save</span>
              </a>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .history-container {
          padding: 1.25rem 1.5rem;
          margin-bottom: 3rem;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
        }

        .history-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .history-icon {
          color: var(--accent-purple);
        }

        .history-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }

        .history-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .clear-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .clear-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          color: white;
        }

        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .history-list {
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          transition: var(--transition-fast);
        }

        .history-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .history-thumb {
          width: 80px;
          height: 45px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .history-meta {
          flex: 1;
          overflow: hidden;
        }

        .history-item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .history-redownload {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: var(--primary);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          transition: var(--transition-fast);
        }

        .history-redownload:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
};
