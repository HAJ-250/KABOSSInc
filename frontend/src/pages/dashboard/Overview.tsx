import { motion } from 'framer-motion';
import { CalendarCheck, MessageSquare, Download, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { icon: CalendarCheck, label: 'Active Bookings', value: '3', color: 'from-kaboss-500 to-cyan-500' },
  { icon: MessageSquare, label: 'Unread Messages', value: '2', color: 'from-purple-500 to-pink-500' },
  { icon: Download, label: 'Available Downloads', value: '5', color: 'from-amber-500 to-orange-500' },
  { icon: Bell, label: 'Notifications', value: '1', color: 'from-green-500 to-emerald-500' },
];

const recentActivity = [
  { action: 'Booking approved', detail: 'Wedding Invitation Printing', time: '2 hours ago' },
  { action: 'File uploaded', detail: 'Graduation photos ready for download', time: '1 day ago' },
  { action: 'Message received', detail: 'New reply from KABOSS support', time: '2 days ago' },
];

export function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {user?.displayName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="h-2 w-2 rounded-full bg-kaboss-500 mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.detail}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Book Service', icon: CalendarCheck, href: '/dashboard/bookings' },
              { label: 'Send Message', icon: MessageSquare, href: '/dashboard/messages' },
              { label: 'View Downloads', icon: Download, href: '/dashboard/downloads' },
              { label: 'Edit Profile', icon: Bell, href: '/dashboard/profile' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 transition-colors"
              >
                <action.icon className="h-6 w-6 text-kaboss-500" />
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
