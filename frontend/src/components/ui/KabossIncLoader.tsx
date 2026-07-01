import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './KabossIncLoader.module.css';

export type KabossIncLoaderProps = {
  /** Controls overlay visibility */
  isVisible: boolean;
  /** Called after the loader finishes its fade-out */
  onComplete?: () => void;
  /** For screen readers */
  ariaLabel?: string;
};

const LOGO_SRC = '/images/kabossinc%20logo.jpg';

export function KabossIncLoader({
  isVisible,
  onComplete,
  ariaLabel = 'Loading',
}: KabossIncLoaderProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [textVisible, setTextVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const completeTimerRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);

  // Preload image for a snappy first impression.
  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    setImageStatus('loading');

    const img = new Image();
    img.decoding = 'async';
    img.src = LOGO_SRC;

    const handleLoad = () => {
      if (cancelled) return;
      setImageStatus('loaded');
    };
    const handleError = () => {
      if (cancelled) return;
      setImageStatus('error');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      cancelled = true;
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [isVisible]);

  // Stagger text appearance; keep timers short and CSS-driven.
  useEffect(() => {
    if (!isVisible) return;

    setTextVisible(false);
    const t = window.setTimeout(() => {
      setTextVisible(true);
    }, prefersReducedMotion ? 0 : 260);

    return () => window.clearTimeout(t);
  }, [isVisible, prefersReducedMotion]);

  // Fade-out when consumer hides the loader.
  useEffect(() => {
    if (isVisible) {
      setIsFadingOut(false);
      if (completeTimerRef.current) {
        window.clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
      return;
    }

    // Only start fade-out if it was visible previously.
    if (!isFadingOut) {
      setIsFadingOut(true);
      completeTimerRef.current = window.setTimeout(() => {
        onComplete?.();
        completeTimerRef.current = null;
      }, 350);
    }
  }, [isVisible, isFadingOut, onComplete]);

  // If not visible and we're fully faded, don't render (keeps main tree clean).
  const shouldRender = isVisible || isFadingOut;
  if (!shouldRender) return null;

  const showLogo = imageStatus !== 'error';

  return (
    <div
      className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className={styles.center}>
        <div className={styles.logoWrap}>
          <div className={styles.logoGlow} aria-hidden="true" />

          {showLogo ? (
            <img
              src={LOGO_SRC}
              alt="KABOSS Inc"
              className={styles.logo}
              draggable={false}
              onError={() => setImageStatus('error')}
            />
          ) : (
            <div className={styles.errorText}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>KABOSS Inc</div>
              <div>Logo failed to load. Continuing…</div>
            </div>
          )}
        </div>

        <div className={styles.text}>
          <span className={`${styles.typewriter} ${textVisible ? styles.typewriterVisible : ''}`}>
            ALMOST WELCOME
          </span>
        </div>

        <div className={styles.progress}>
          <div className={styles.bar} aria-hidden="true">
            <div className={styles.fill} />
          </div>

          <div className={styles.statusRow}>
            <div className={styles.spinner} aria-hidden="true" />
            <div className={styles.statusText}>
              {imageStatus === 'loaded' ? 'Preparing your experience…' : 'Loading assets…'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

