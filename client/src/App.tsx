import React from 'react';
import { MediaProvider } from './context/MediaContext';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { MediaPreview } from './components/MediaPreview';
import { FormatSelector } from './components/FormatSelector';
import { ProgressCard } from './components/ProgressCard';
import { DownloadHistory } from './components/DownloadHistory';
import { Toast } from './components/Toast';
import { Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import './styles/global.css';

const AppContent: React.FC = () => {
  return (
    <div className="app-wrapper">
      <Header />

      <main className="main-content">
        <UrlInput />
        <ProgressCard />
        <MediaPreview />
        <FormatSelector />

        {/* Feature Highlights Section */}
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-box cyan">
              <Zap size={22} />
            </div>
            <h4>Ultra High Bitrate</h4>
            <p>Download original 4K 60fps video streams and losslessly merged audio without quality reduction.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box purple">
              <Sparkles size={22} />
            </div>
            <h4>320kbps MP3 Audio</h4>
            <p>Extract crystal-clear audio tracks with customizable bitrates and embedded metadata tag options.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box pink">
              <Shield size={22} />
            </div>
            <h4>Secure & Clean</h4>
            <p>Zero popups or redirect spam. Pure direct streaming with instant automatic background cleanup.</p>
          </div>
        </div>

        <DownloadHistory />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-title">StreamPulse</span>
            <span className="footer-copy">© {new Date().getFullYear()} StreamPulse. High Performance Media Downloader.</span>
          </div>

          <div className="footer-disclaimer">
            <CheckCircle2 size={14} className="disclaimer-icon" />
            <span>Please only download media content you are authorized to access.</span>
          </div>
        </div>
      </footer>

      <Toast />

      <style>{`
        .app-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .main-content {
          flex: 1;
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem 3rem 1.5rem;
          position: relative;
          z-index: 10;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin: 3rem 0;
        }

        .feature-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .feature-icon-box {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .feature-icon-box.cyan {
          background: rgba(6, 182, 212, 0.15);
          color: #06b6d4;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .feature-icon-box.purple {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .feature-icon-box.pink {
          background: rgba(236, 72, 153, 0.15);
          color: #ec4899;
          border: 1px solid rgba(236, 72, 153, 0.3);
        }

        .feature-card h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }

        .feature-card p {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .app-footer {
          border-top: 1px solid var(--border-color);
          background: rgba(7, 9, 14, 0.95);
          padding: 2rem 1.5rem;
          margin-top: auto;
          position: relative;
          z-index: 10;
        }

        .footer-content {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .footer-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.1rem;
          color: white;
        }

        .footer-copy {
          font-size: 0.8rem;
          color: var(--text-subtle);
        }

        .footer-disclaimer {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
        }

        .disclaimer-icon {
          color: var(--primary);
        }

        @media (max-width: 640px) {
          .footer-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MediaProvider>
      <AppContent />
    </MediaProvider>
  );
};

export default App;
