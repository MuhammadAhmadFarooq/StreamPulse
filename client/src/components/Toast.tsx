import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export const Toast: React.FC = () => {
  const { toast } = useMedia();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast || !visible) return null;

  const { message, type } = toast;

  return (
    <div className={`toast-notification ${type} animate-fade-in`}>
      {type === 'success' && <CheckCircle2 size={18} className="toast-icon" />}
      {type === 'error' && <AlertCircle size={18} className="toast-icon" />}
      {type === 'info' && <Info size={18} className="toast-icon" />}

      <span className="toast-message">{message}</span>

      <style>{`
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.4rem;
          border-radius: var(--radius-full);
          background: rgba(18, 24, 38, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .toast-notification.success {
          border-color: rgba(34, 197, 94, 0.4);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }

        .toast-notification.success .toast-icon {
          color: #22c55e;
        }

        .toast-notification.error {
          border-color: rgba(239, 68, 68, 0.4);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
        }

        .toast-notification.error .toast-icon {
          color: #ef4444;
        }

        .toast-notification.info .toast-icon {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};
