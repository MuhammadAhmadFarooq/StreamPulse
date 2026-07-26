import React from 'react';
import { Link, Clipboard, X, ArrowRight, Loader2 } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export const UrlInput: React.FC = () => {
  const { url, setUrl, isLoadingInfo, analyzeUrl, showToast } = useMedia();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        showToast('Link pasted from clipboard!', 'success');
        analyzeUrl(text);
      }
    } catch {
      showToast('Clipboard access denied. Please paste manually.', 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeUrl();
  };

  return (
    <div className="url-section">
      <h1 className="hero-title">
        Download Authorized Media in <span className="gradient-text">Ultra HD</span>
      </h1>
      <p className="hero-subtitle">
        Convert supported media links into high-bitrate MP4 video or 320kbps MP3 audio seamlessly.
      </p>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper glass-card">
          <Link className="input-icon" size={20} />
          
          <input
            id="media-url-input"
            type="url"
            className="url-field"
            placeholder="Paste media URL (e.g. https://www.youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoadingInfo}
            required
          />

          {url ? (
            <button
              type="button"
              className="action-icon-btn"
              onClick={() => setUrl('')}
              title="Clear input"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              type="button"
              className="action-icon-btn paste-btn"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              <Clipboard size={18} />
              <span className="btn-label">Paste</span>
            </button>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoadingInfo || !url.trim()}
          >
            {isLoadingInfo ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze Link</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .url-section {
          text-align: center;
          margin: 2rem auto 3rem auto;
          max-width: 850px;
          padding: 0 1.5rem;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 0.75rem;
          color: white;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .input-form {
          width: 100%;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.6rem 0.5rem 1.25rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          gap: 0.75rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: var(--transition-smooth);
        }

        .input-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: var(--glow-primary);
        }

        .input-icon {
          color: var(--text-subtle);
          flex-shrink: 0;
        }

        .url-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 1rem;
          font-family: var(--font-family);
        }

        .url-field::placeholder {
          color: var(--text-subtle);
        }

        .action-icon-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          border-radius: var(--radius-full);
          padding: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .action-icon-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .btn-label {
          font-size: 0.75rem;
          font-weight: 600;
          padding-right: 0.25rem;
        }

        .submit-btn {
          background: var(--gradient-main);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          white-space: nowrap;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--glow-primary);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 2rem;
          }
          .input-wrapper {
            border-radius: var(--radius-lg);
            flex-wrap: wrap;
            padding: 0.75rem;
          }
          .submit-btn {
            width: 100%;
            justify-content: center;
            margin-top: 0.5rem;
          }
          .btn-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
