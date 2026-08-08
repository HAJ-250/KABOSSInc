import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';
import { useTranslatedServices } from '@/hooks/useTranslatedServices';
import { useI18n } from '@/i18n';
import { LanguageSelector } from '@/components/layout/LanguageSelector';

export function Header() {
  const { t } = useI18n();
  const translatedServices = useTranslatedServices();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const location = useLocation();

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    {
      label: t('nav.services'),
      href: '/services',
      children: translatedServices.map((s) => ({
        label: s.title,
        href: `/services/${s.id}`,
        icon: s.icon,
      })),
    },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.gallery'), href: '/gallery' },
    { label: t('nav.partners'), href: '/partners' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

// Always use a dark premium header so navbar/link text is always visible
  // regardless of the page or scroll state.
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        'bg-gradient-to-r from-premium-dark via-premium-navy to-premium-dark',
        scrolled
          ? 'bg-premium-dark/90 backdrop-blur-2xl shadow-lg shadow-black/20'
          : 'bg-premium-dark/70 backdrop-blur-xl'
      )}
    >
      {/* Background image layer */}
      <div className="pointer-events-none absolute inset-0 -z-10 app-bg-image-fixed opacity-20" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-white/10 ring-2 ring-kaboss-500/30 flex items-center justify-center shadow-lg shadow-kaboss-500/20">
              <img
                src="/images/kabossinc%20logo.jpg"
                alt="KABOSS Inc"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                KABOSS
              </span>
              <span className="text-xs text-gray-400 block -mt-1">Inc</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    location.pathname === link.href
                      ? 'text-white bg-kaboss-500/20 ring-1 ring-kaboss-500/40'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                  {link.children && <ChevronDown className="h-4 w-4" />}
                </Link>
                {link.children && activeDropdown === link.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-premium-dark border border-gray-100 dark:border-gray-800 shadow-2xl p-2"
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:text-kaboss-600 dark:hover:text-kaboss-400 hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center">
                          {child.icon && <child.icon className="h-4 w-4 text-kaboss-600" />}
                        </div>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

<div className="flex items-center gap-3">
<button
              onClick={toggleDarkMode}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-200 hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <LanguageSelector compact />
            <Link to="/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">{t('nav.getStarted')}</Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center text-gray-200 hover:bg-white/10"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
className="lg:hidden border-t border-white/10 bg-premium-dark/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
<Link
                to="/login"
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 sm:hidden"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.signIn')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
