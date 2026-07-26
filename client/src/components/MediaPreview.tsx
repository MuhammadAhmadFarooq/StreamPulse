import React from 'react';
import { PlayCircle, Clock, User, Film } from 'lucide-react';
import { useMedia } from '../context/MediaContext';

export const MediaPreview: React.FC = () => {
  const { mediaInfo, isLoadingInfo } = useMedia();

  if (isLoadingInfo) {
    return (
      <div className="preview-container glass-card animate-fade-in">
        <div className="preview-skeleton-layout">
          <div className="thumbnail-skeleton skeleton" />
          <div className="info-skeleton">
            <div className="title-skeleton skeleton" />
            <div className="sub-skeleton skeleton" />
            <div className="badges-skeleton skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!mediaInfo) return null;

  return (
    <div className="preview-container glass-card animate-fade-in">
      <div className="media-card">
        <div className="thumbnail-wrapper">
          <img
            src={mediaInfo.thumbnail || 'https://via.placeholder.com/640x360?text=No+Thumbnail'}
            alt={mediaInfo.title}
            className="thumbnail-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&q=80';
            }}
          />
          <div className="duration-badge">
            <Clock size={12} />
            <span>{mediaInfo.durationFormatted}</span>
          </div>
          <div className="play-overlay">
            <PlayCircle size={44} className="play-icon" />
          </div>
        </div>

        <div className="media-details">
          <h2 className="media-title" title={mediaInfo.title}>
            {mediaInfo.title}
          </h2>

          <div className="uploader-info">
            <User size={15} className="uploader-icon" />
            <span>{mediaInfo.uploader}</span>
          </div>

          <div className="media-meta-tags">
            <div className="meta-tag">
              <Film size={14} />
              <span>{mediaInfo.formats.length} Quality Formats</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .preview-container {
          margin-bottom: 2rem;
          padding: 1.5rem;
        }

        .media-card {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .thumbnail-wrapper {
          position: relative;
          width: 240px;
          height: 135px;
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }

        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .thumbnail-wrapper:hover .thumbnail-img {
          transform: scale(1.05);
        }

        .duration-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          color: white;
          padding: 0.25rem 0.55rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .thumbnail-wrapper:hover .play-overlay {
          opacity: 1;
        }

        .play-icon {
          color: white;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.8));
        }

        .media-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow: hidden;
        }

        .media-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .uploader-info {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .uploader-icon {
          color: var(--primary);
        }

        .media-meta-tags {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .meta-tag {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: var(--primary);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Skeleton styling */
        .preview-skeleton-layout {
          display: flex;
          gap: 1.5rem;
        }
        .thumbnail-skeleton {
          width: 240px;
          height: 135px;
          border-radius: var(--radius-md);
        }
        .info-skeleton {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          justify-content: center;
        }
        .title-skeleton {
          height: 24px;
          width: 80%;
        }
        .sub-skeleton {
          height: 16px;
          width: 40%;
        }
        .badges-skeleton {
          height: 20px;
          width: 30%;
        }

        @media (max-width: 640px) {
          .media-card, .preview-skeleton-layout {
            flex-direction: column;
            align-items: flex-start;
          }
          .thumbnail-wrapper, .thumbnail-skeleton {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};
