import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CalendarCheck, MessageSquare, Download, Bell, User,
  Settings, LogOut, Menu, X, ChevronDown, Home, Image as ImageIcon, FileText, CreditCard, Moon, Sun,
} from 'lucide-react';
import { cn, resolveImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useThemeStore } from '@/store/useThemeStore';
import toast from 'react-hot-toast';
import { Footer } from '@/components/layout/Footer';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: CalendarCheck, label: 'My Bookings', href: '/dashboard/bookings' },
  { icon: FileText, label: 'My Quotes', href: '/dashboard/quotes' },
  { icon: CreditCard, label: 'Payments', href: '/dashboard/payments' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: Download, label: 'Downloads', href: '/dashboard/downloads' },
  { icon: ImageIcon, label: 'Gallery', href: '/dashboard/gallery' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-premium-dark border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
<div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden ring-2 ring-kaboss-500/30">
              <img
                src="/images/kabossinc%20logo.jpg"
                alt="KABOSS Inc"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-bold bg-gradient-to-r from-kaboss-600 to-kaboss-800 bg-clip-text text-transparent">KABOSS</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-kaboss-500 text-white shadow-lg shadow-kaboss-500/25'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-premium-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Welcome back, <span className="font-medium text-gray-800 dark:text-white">{user?.displayName}</span>
            </div>

<div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
<div className="h-8 w-8 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                  {(user as any)?.profilePictureUrl ? (
                    <img
                      src={resolveImageUrl((user as any).profilePictureUrl)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.displayName?.charAt(0) || 'U'
                  )}
                </div>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-premium-dark border border-gray-100 dark:border-gray-800 shadow-2xl p-2"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                      <p className="font-medium text-sm">{user?.displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link to="/dashboard/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link to="/dashboard/settings" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
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

{/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
        {/* Consistent footer across all dashboard pages */}
        <Footer />
      </div>
    </div>
  );
}
