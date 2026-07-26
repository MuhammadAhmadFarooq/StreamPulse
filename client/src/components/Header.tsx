import React from 'react';
import { Download, Zap, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="logo-icon">
          <Download className="icon-glow" size={24} />
        </div>
        <div className="brand-text">
          <span className="brand-name">StreamPulse</span>
          <span className="brand-tag">PRO MEDIA CONVERTER</span>
        </div>
      </div>

      <div className="header-badges">
        <div className="badge-pill">
          <Zap size={14} className="badge-icon" />
          <span>Fast Processing</span>
        </div>
        <div className="badge-pill">
          <ShieldCheck size={14} className="badge-icon" />
          <span>4K & 320kbps</span>
        </div>
      </div>

      <style>{`
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: var(--gradient-main);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--glow-primary);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }

        .brand-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.1em;
        }

        .header-badges {
          display: flex;
          gap: 0.75rem;
        }

        .badge-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          color: var(--text-muted);
          backdrop-filter: blur(8px);
        }

        .badge-icon {
          color: var(--primary);
        }

        @media (max-width: 640px) {
          .header-badges {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
