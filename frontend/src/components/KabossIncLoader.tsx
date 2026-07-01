import { useState, useEffect } from 'react';
import styles from './KabossIncLoader.module.css';

interface KabossIncLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function KabossIncLoader({ isVisible, onComplete }: KabossIncLoaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setImageLoaded(false);
      return;
    }

    setImageLoaded(true);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 30;
        if (next >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return next;
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, [isVisible]);

  useEffect(() => {
    if (progress >= 95 && isVisible) {
      const timer = setTimeout(() => {
        setProgress(100);
        if (onComplete) {
          setTimeout(onComplete, 600);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.loaderOverlay} ${progress === 100 ? styles.fadeOut : ''}`}>
      <div className={styles.loaderContainer}>
        {/* Logo with glow effect */}
        <div className={`${styles.logoWrapper} ${imageLoaded ? styles.loaded : ''}`}>
          {imageError ? (
            <div className={styles.logoFallback} aria-label="KABOSS Inc">
              KABOSS<br />Inc
            </div>
          ) : (
            <img
              src="/images/kabossinc%20logo.jpg"
              alt="KABOSS Inc Logo"
              className={styles.logo}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              role="img"
              aria-label="KABOSS Inc Logo"
            />
          )}
        </div>

        {/* Text animation */}
        <div className={`${styles.textWrapper} ${imageLoaded ? styles.visible : ''}`}>
          <h1 className={styles.welcomeText}>ALMOST WELCOME</h1>
          <p className={styles.subtitle}>Preparing your experience...</p>
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
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </div>
    </div>
  );
}
