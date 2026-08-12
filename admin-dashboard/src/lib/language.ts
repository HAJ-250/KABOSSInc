import { useReducer, useEffect } from 'react';

export type LanguageCode = 'en' | 'rw' | 'fr';

export const LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'rw', name: 'Kinyarwanda', flag: '\u{1F1F7}\u{1F1FC}' },
  { code: 'fr', name: 'Fran\u00e7ais', flag: '\u{1F1EB}\u{1F1F7}' },
];

// Same storage key as the customer frontend so both apps share the preference.
const STORAGE_KEY = 'kaboss_lang';

function getInitialLang(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (saved && ['en', 'rw', 'fr'].includes(saved)) return saved;
  return 'en';
}

let listeners = new Set<() => void>();
let cached: LanguageCode | null = null;

function getLang(): LanguageCode {
  if (!cached) cached = getInitialLang();
  return cached;
}

function setLang(lang: LanguageCode) {
  cached = lang;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
  listeners.forEach((l) => l());
}

export function useAdminLanguage() {
  const [, forceRender] = useReducer((c: number) => c + 1, 0);

  useEffect(() => {
    const listener = () => forceRender();
    listeners.add(listener);
    window.addEventListener('storage', listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', listener);
    };
  }, []);

  return {
    lang: getLang(),
    setLang,
  };
}
