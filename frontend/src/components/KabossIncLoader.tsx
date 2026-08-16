import { useState, useEffect } from 'react';
import styles from './KabossIncLoader.module.css';

import { resolveImageUrl } from '@/lib/utils';

interface KabossIncLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const PROFILE_IMAGE = resolveImageUrl('/uploads/profile/1783354105972-bbf27ec5555f78.jpg');

export function KabossIncLoader({ isVisible, onComplete }: KabossIncLoaderProps) {
  const [imageError, setImageError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    // Faster, snappier progress increments
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 16 + 4;
        if (next >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, [isVisible]);

  useEffect(() => {
    if (progress >= 95 && isVisible) {
      const timer = setTimeout(() => {
        setProgress(100);
        if (onComplete) {
          setTimeout(onComplete, 350);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.loaderOverlay} ${progress === 100 ? styles.fadeOut : ''}`}
      role="status"
      aria-label="Loading KABOSS Inc"
    >
      {/* Animated glowing orbs */}
      <div className={`${styles.orb} ${styles.orbOne}`} />
      <div className={`${styles.orb} ${styles.orbTwo}`} />
      <div className={`${styles.orb} ${styles.orbThree}`} />

      {/* Futuristic grid overlay */}
      <div className={styles.gridOverlay} />

      {/* KABOSS text scrolling from bottom to top */}
      <div className={styles.scrollBg}>
        <div className={styles.scrollColumn}>
          <span className={`${styles.scrollWord} ${styles.scrollWordAccent}`}>KABOSS</span>
          <span className={styles.scrollWord}>DIGITAL</span>
          <span className={`${styles.scrollWord} ${styles.scrollWordAccent}`}>KABOSS</span>
          <span className={styles.scrollWord}>STUDIO</span>
          <span className={`${styles.scrollWord} ${styles.scrollWordAccent}`}>KABOSS</span>
          <span className={styles.scrollWord}>PREMIUM</span>
        </div>
      </div>

      <div className={styles.loaderContainer}>
        {/* Circular rotating image frame */}
        <div className={styles.circleWrap}>
          <div className={styles.ringOuter} />
          <div className={styles.ring} />
          <div className={styles.glow} />
          <div className={styles.imageWrap}>
            {imageError ? (
              <div
                className={styles.image}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg,#2b8fff,#a855f7)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                K
              </div>
            ) : (
              <img
                src={PROFILE_IMAGE}
                alt="KABOSS Inc"
                className={styles.image}
                draggable={false}
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>

        {/* Welcome text */}
        <div className={styles.textWrapper}>
          <h1 className={styles.welcomeText}>Bringing your vision to life…</h1>
          <p className={styles.brandName}>KABOSS Inc</p>
        </div>

        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className={styles.progressText}>{Math.round(progress)}%</span>
        </div>

        {/* Decorative elements */}
        <div className={styles.decorativeElements}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      </div>
    </div>
  );
}
