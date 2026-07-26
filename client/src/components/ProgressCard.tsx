import React from 'react';
import { DownloadCloud, CheckCircle2, AlertTriangle, Loader2, FileDown } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export const ProgressCard: React.FC = () => {
  const { activeProgress } = useMedia();

  if (!activeProgress) return null;

  const { percent, speed, eta, status, error, jobId, fileName } = activeProgress;

  const isCompleted = status === 'completed';
  const isError = status === 'error';
  const isProcessing = status === 'processing';

  return (
    <div className={`progress-container glass-card animate-fade-in ${isCompleted ? 'completed-card' : ''}`}>
      <div className="progress-header">
        <div className="status-label">
          {isCompleted ? (
            <>
              <CheckCircle2 size={22} className="icon-success" />
              <span className="status-title">Conversion & Download Ready!</span>
            </>
          ) : isError ? (
            <>
              <AlertTriangle size={22} className="icon-error" />
              <span className="status-title text-error">Download Failed</span>
            </>
          ) : isProcessing ? (
            <>
              <Loader2 size={22} className="icon-spinner" />
              <span className="status-title">Processing & Merging Audio/Video...</span>
            </>
          ) : (
            <>
              <DownloadCloud size={22} className="icon-active" />
              <span className="status-title">Downloading Media Stream...</span>
            </>
          )}
        </div>

        <div className="percent-display">
          <span>{Math.round(percent)}%</span>
        </div>
      </div>

      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${isCompleted ? 'fill-completed' : isError ? 'fill-error' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      <div className="progress-stats">
        {!isCompleted && !isError && (
          <>
            <span className="stat-item">⚡ Speed: <strong>{speed}</strong></span>
            <span className="stat-item">⏱️ ETA: <strong>{eta}</strong></span>
          </>
        )}

        {isCompleted && (
          <div className="completed-actions">
            <span className="success-msg">File saved — or click below to save again.</span>
            <button
              type="button"
              className="redownload-link"
              onClick={() => {
                const ext = fileName?.split('.').pop() || 'mp4';
                const safeName = (fileName || 'video')
                  .replace(/_job_[a-z0-9_]+$/, '')
                  .replace(/[\\/:*?"<>|]/g, '_');
                const finalName = safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`;

                fetch(`/api/media/file/${jobId}`)
                  .then((res) => {
                    if (!res.ok) throw new Error(`Server error ${res.status}`);
                    return res.blob();
                  })
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.setAttribute('download', finalName);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 10_000);
                  })
                  .catch((err) => console.error('Re-download failed:', err));
              }}
            >
              <FileDown size={16} />
              <span>Save File</span>
            </button>
          </div>
        )}

        {isError && <span className="error-msg">{error || 'An unexpected error occurred.'}</span>}
      </div>

      <style>{`
        .progress-container {
          padding: 1.75rem;
          margin-bottom: 2rem;
          background: rgba(18, 24, 38, 0.9);
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .completed-card {
          border-color: rgba(34, 197, 94, 0.4);
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.15);
        }

        .progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .status-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .status-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          color: white;
        }

        .text-error {
          color: #ef4444;
        }

        .icon-active {
          color: var(--primary);
          animation: pulseGlow 2s infinite;
        }

        .icon-spinner {
          color: var(--accent-cyan);
          animation: spin 1s linear infinite;
        }

        .icon-success {
          color: #22c55e;
        }

        .icon-error {
          color: #ef4444;
        }

        .percent-display {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
        }

        .progress-bar-track {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 1rem;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--gradient-main);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
        }

        .fill-completed {
          background: linear-gradient(90deg, #10b981 0%, #22c55e 100%);
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
        }

        .fill-error {
          background: #ef4444;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
        }

        .progress-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .completed-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 1rem;
        }

        .success-msg {
          color: #86efac;
          font-size: 0.9rem;
        }

        .redownload-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          transition: var(--transition-fast);
        }

        .redownload-link:hover {
          background: rgba(34, 197, 94, 0.3);
          color: white;
        }

        .error-msg {
          color: #fca5a5;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
