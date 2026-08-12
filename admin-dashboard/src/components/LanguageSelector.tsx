import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { LANGUAGES, useAdminLanguage, type LanguageCode } from '../lib/language';

/**
 * Language selector dropdown for the admin dashboard.
 * Visually consistent with the customer site's selector and shares the same
 * localStorage key (`kaboss_lang`) so the language preference stays in sync.
 */
export function LanguageSelector({
  align = 'right',
  compact = false,
}: {
  align?: 'left' | 'right';
  compact?: boolean;
}) {
  const { lang, setLang } = useAdminLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative" data-testid="language-selector">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'flex items-center gap-1.5 rounded-xl transition-colors',
          'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          compact ? 'h-10 w-10 justify-center px-0' : 'h-10 px-3'
        )}
      >
        <Globe className="h-4 w-4 shrink-0" />
        {!compact && (
          <>
            <span className="text-xs font-medium leading-none">{current.flag}</span>
            <ChevronDown className={clsx('h-3.5 w-3.5 text-gray-400 transition-transform', open && 'rotate-180')} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className={clsx(
              'absolute top-full mt-2 w-44 rounded-2xl bg-white dark:bg-premium-dark border border-gray-100 dark:border-gray-800 shadow-2xl p-1.5 z-[60]',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {LANGUAGES.map((l) => {
              const active = l.code === lang;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(l.code as LanguageCode);
                    setOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors',
                    active
                      ? 'bg-kaboss-50 dark:bg-kaboss-950/50 text-kaboss-700 dark:text-kaboss-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <span className="flex-1 text-left font-medium">{l.name}</span>
                  {active && <Check className="h-4 w-4 text-kaboss-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
