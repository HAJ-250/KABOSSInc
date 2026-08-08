import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarCheck, FileText, Globe,
  MessageSquare, Star, HelpCircle, Megaphone, Settings,
  Image as ImageIcon, UserCircle2, CreditCard,
  LogOut, Menu, X, ChevronDown, Home, Moon, Sun,
  MapPin, Phone, Mail, Clock,
} from 'lucide-react';

import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { setToken, getStoredUser, setStoredUser, apiRequest, resolveImageUrl } from '../lib/api';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Users', href: '/users' },
{ icon: CalendarCheck, label: 'Bookings', href: '/bookings' },
  { icon: CreditCard, label: 'Payments', href: '/payments' },
  { icon: MessageSquare, label: 'Messages', href: '/messages' },
  { icon: FileText, label: 'Services', href: '/services' },
  { icon: Globe, label: 'Partners', href: '/partners' },
  { icon: Star, label: 'Testimonials', href: '/testimonials' },
  { icon: HelpCircle, label: 'FAQs', href: '/faqs' },
  { icon: Megaphone, label: 'Announcements', href: '/announcements' },
  { icon: MessageSquare, label: 'Contacts', href: '/contacts' },
  { icon: ImageIcon, label: 'Gallery Uploads', href: '/gallery-uploads' },
  { icon: UserCircle2, label: 'Profile Uploads', href: '/profile-uploads' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];


export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );
  const fileRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUserState] = useState<any>(getStoredUser());

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await apiRequest<any>('/profile-picture', { method: 'POST', body: form });
      const next = { ...user, profilePictureUrl: res.profilePictureUrl };
      setStoredUser(next);
      setUserState(next);
      toast.success('Profile picture updated');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setStoredUser(null);
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-premium-dark">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={clsx(
        'fixed top-0 left-0 z-50 h-full w-64 bg-premium-dark text-white transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
<Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden ring-2 ring-kaboss-500/40">
              <img
                src="/images/kabossinc%20logo.jpg"
                alt="KABOSS Inc"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="font-bold bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">KABOSS</span>
              <span className="text-xs text-gray-400 block -mt-1">Admin Panel</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100%-140px)]">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-kaboss-500 text-white shadow-lg shadow-kaboss-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <a href="http://localhost:5173" target="_blank" rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Home className="h-4 w-4" />
            Back to Website
          </a>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-premium-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <Menu className="h-5 w-5" />
            </button>

<div className="flex items-center gap-4 ml-auto">
              <button
                onClick={handleToggleDarkMode}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative">
<button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                    {user?.profilePictureUrl ? (
                      <img src={resolveImageUrl(user.profilePictureUrl)} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      user?.displayName?.charAt(0) || 'A'
                    )}
                  </div>
                  <ChevronDown className={clsx('h-4 w-4 text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-premium-dark border border-gray-100 dark:border-gray-800 shadow-2xl p-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2 flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-lg font-medium overflow-hidden shrink-0">
                          {user?.profilePictureUrl ? (
                            <img src={resolveImageUrl(user.profilePictureUrl)} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            user?.displayName?.charAt(0) || 'A'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{user?.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                        </div>
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleUpload(f);
                        }}
                      />
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 w-full disabled:opacity-60"
                      >
                        <UserCircle2 className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Change Photo'}
                      </button>
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 w-full">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

<main className="p-4 lg:p-8">
          <Outlet />
        </main>

        {/* Consistent premium footer */}
        <footer className="relative bg-premium-dark text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-kaboss-500/10 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl overflow-hidden ring-2 ring-kaboss-500/30 shadow-lg shadow-kaboss-500/20">
                    <img
                      src="/images/kabossinc%20logo.jpg"
                      alt="KABOSS Inc"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">KABOSS</span>
                    <span className="text-xs text-gray-400 block -mt-1">Admin Panel</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                  KABOSS Inc — Your trusted partner for professional photography, printing, and digital services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-5">Quick Links</h3>
                <ul className="space-y-3">
                  {[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Users', href: '/users' },
                    { label: 'Bookings', href: '/bookings' },
                    { label: 'Payments', href: '/payments' },
                    { label: 'Site Settings', href: '/settings' },
                  ].map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        to={link.href}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
                      >
                        <span className="h-1 w-1 rounded-full bg-kaboss-500 group-hover:scale-150 transition-transform" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-5">Contact</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-kaboss-400 mt-0.5 shrink-0" />
                    <span className="text-gray-400 text-sm">Rwanda, Kigali</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-kaboss-400 shrink-0" />
                    <a href="tel:+250788882296" className="text-gray-400 text-sm hover:text-white transition-colors">+250 788 882 296</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-kaboss-400 shrink-0" />
                    <a href="mailto:kabbossimage@gmail.com" className="text-gray-400 text-sm hover:text-white transition-colors">kabbossimage@gmail.com</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-kaboss-400 mt-0.5 shrink-0" />
                    <div className="text-gray-400 text-sm">
                      <p>Mon - Sat: 9:00 AM – 6:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} KABOSS Inc. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                Admin Management Portal
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
