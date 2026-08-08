import { create } from 'zustand';

export type LanguageCode = 'en' | 'rw' | 'fr';

export const LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

interface LanguageStore {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  toggle?: () => void;
}

const STORAGE_KEY = 'kaboss_lang';

function getInitialLang(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (saved && ['en', 'rw', 'fr'].includes(saved)) return saved;
  return 'en';
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  lang: getInitialLang(),
  setLang: (lang) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    set({ lang });
  },
}));

