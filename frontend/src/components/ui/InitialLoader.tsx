import { useEffect, useState } from 'react';
import { SplashLogo } from './SplashLogo';

export function InitialLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure splash appears immediately after first render.
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <SplashLogo />;
}

