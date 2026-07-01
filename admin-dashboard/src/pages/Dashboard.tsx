import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, MessageSquare, FileText, Globe, Star, HelpCircle, Megaphone, TrendingUp, Settings } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { getStoredUser } from '../lib/api';

const statCards = [
  { key: 'users', icon: Users, label: 'Total Users', color: 'from-purple-500 to-pink-500' },
  { key: 'bookings', icon: CalendarCheck, label: 'Total Bookings', color: 'from-amber-500 to-orange-500' },
  { key: 'services', icon: FileText, label: 'Services', color: 'from-kaboss-500 to-cyan-500' },
  { key: 'partners', icon: Globe, label: 'Partners', color: 'from-green-500 to-emerald-500' },
  { key: 'testimonials', icon: Star, label: 'Testimonials', color: 'from-yellow-500 to-amber-500' },
  { key: 'faqs', icon: HelpCircle, label: 'FAQs', color: 'from-teal-500 to-cyan-500' },
  { key: 'announcements', icon: Megaphone, label: 'Announcements', color: 'from-red-500 to-rose-500' },
  { key: 'contacts', icon: MessageSquare, label: 'Messages', color: 'from-indigo-500 to-purple-500' },
  { key: 'messages', icon: MessageSquare, label: 'Chat Messages', color: 'from-sky-500 to-blue-500' },
];

export function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const user = getStoredUser();

  useEffect(() => {
    apiRequest<Record<string, number>>('/admin/stats')
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {user?.displayName || 'Admin'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats[card.key] ?? '...'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users', href: '/users', icon: Users },
            { label: 'View Bookings', href: '/bookings', icon: CalendarCheck },
            { label: 'Edit Services', href: '/services', icon: FileText },
            { label: 'Site Settings', href: '/settings', icon: Settings },
          ].map((action) => (
            <a key={action.label} href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 transition-colors"
            >
              <action.icon className="h-6 w-6 text-kaboss-500" />
              <span className="text-sm font-medium">{action.label}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
