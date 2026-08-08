import React, { createContext, useContext, useMemo } from 'react';
import { en } from './translations/en';
import { rw } from './translations/rw';
import { fr } from './translations/fr';
import { useLanguageStore } from '@/store/useLanguageStore';
import type { LanguageCode } from '@/store/useLanguageStore';

export type { LanguageCode } from '@/store/useLanguageStore';

// Flattened translation dictionaries
const translations: Record<LanguageCode, Record<string, any>> = {
  en,
  rw,
  fr,
};

// Fallback dictionary (English) used for graceful fallback
const fallback = en;

/**
 * Resolve a dot-notated key against a dictionary object, e.g.
 * t('nav.home') → translations['nav']['home']
 */
function resolvePath(obj: any, path: string): string | null {
  if (!path) return null;
  // Split on dots, but support array index notation like "items[0]".
  const parts = path.split('.').flatMap((seg) => {
    const m = seg.match(/^(.+?)\[(\d+)\]$/);
    if (m) return [m[1], Number(m[2])];
    return [seg];
  });
  let cur: any = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') {
      return null;
    }
    if (typeof part === 'number') {
      if (!Array.isArray(cur) || !(part in cur)) return null;
      cur = cur[part];
    } else {
      if (!(part in cur)) return null;
      cur = cur[part];
    }
  }
  return typeof cur === 'string' ? cur : null;
}

interface I18nContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguageStore();

  const value = useMemo<I18nContextValue>(() => {
    const dict = translations[lang] || fallback;

    const t = (key: string, params?: Record<string, string | number>): string => {
      let str = resolvePath(dict, key);
      if (str == null) {
        // Graceful fallback to English, then to the raw key.
        str = resolvePath(fallback, key);
        if (str == null) return key;
      }
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    };

    return { lang, setLang, t };
  }, [lang, setLang]);

return React.createElement(
    I18nContext.Provider,
    { value },
    children
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
