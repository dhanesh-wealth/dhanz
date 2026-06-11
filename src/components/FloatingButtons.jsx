import { useState, useEffect, useCallback } from 'react';
import { getWhatsAppUrl } from '../utils/whatsapp';
import './FloatingButtons.css';

const SHOW_THRESHOLD = 5;
const RING_RADIUS = 42;

function getScrollProgress() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
}

export default function FloatingButtons({ data }) {
  const { contact } = data;
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    setProgress(getScrollProgress());
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [updateProgress]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = getWhatsAppUrl(
    contact.whatsapp,
    contact.whatsappGreeting,
  );

  const visible = progress >= SHOW_THRESHOLD;
  const displayPercent = Math.round(progress);
  return (
    <div className="floating-buttons" aria-label="Quick action buttons">
      <button
        type="button"
        className={`floating-btn floating-btn--scroll ${visible ? 'floating-btn--scroll-visible' : ''}`}
        onClick={scrollToTop}
        aria-label={`Scroll to top — ${displayPercent}% of page read`}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
      >
        <svg className="floating-btn__ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            className="floating-btn__ring-track"
            cx="50"
            cy="50"
            r={RING_RADIUS}
            pathLength="100"
          />
          <circle
            className="floating-btn__ring-progress"
            cx="50"
            cy="50"
            r={RING_RADIUS}
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
          />
        </svg>
        <span className="floating-btn__percent">{displayPercent}%</span>
      </button>

      <a
        href={whatsappUrl}
        className="floating-btn floating-btn--whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
