import { useEffect, useState } from 'react';

export function SplashLogo() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Keep it short to avoid slowing down the first paint.
    const t = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-premium-dark"
      aria-label="Loading"
      role="status"
    >
      <img
        src="/images/kabossinc%20logo.jpg"
        alt="KABOSS Inc"
        className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover shadow-lg"
        draggable={false}
      />
    </div>
  );
}

