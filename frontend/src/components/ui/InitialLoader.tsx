import { useEffect, useState } from 'react';
import { KabossIncLoader } from '../KabossIncLoader';

export function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <KabossIncLoader
      isVisible={isVisible}
      onComplete={() => setIsVisible(false)}
    />
  );
}
