import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';
import { services } from '@/data/services';

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: services.map((s) => ({
      label: s.title,
      href: `/services#${s.id}`,
      icon: s.icon,
    })),
  },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Partners', href: '/partners' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-white/80 dark:bg-premium-dark/80 backdrop-blur-2xl shadow-lg shadow-black/5'
          : 'bg-transparent'
      )}
    >
      {/* Background image layer */}
      <div className="pointer-events-none absolute inset-0 -z-10 app-bg-image-fixed opacity-30" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
              <img
                src="/images/kabossinc%20logo.jpg"
                alt="KABOSS Inc"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-kaboss-500 to-kaboss-700 bg-clip-text text-transparent">
                KABOSS
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 block -mt-1">Inc</span>
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
                      ? 'text-kaboss-600 dark:text-kaboss-400 bg-kaboss-50 dark:bg-kaboss-950/50'
                      : 'text-gray-600 dark:text-gray-300 hover:text-kaboss-600 dark:hover:text-kaboss-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
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
              className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
            className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-premium-dark"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-kaboss-600 dark:hover:text-kaboss-400 hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-kaboss-600 dark:hover:text-kaboss-400 hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 sm:hidden"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
