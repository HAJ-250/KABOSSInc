import { motion } from 'framer-motion';
import { Users, CalendarCheck, MessageSquare, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { icon: Eye, label: 'Visitors Today', value: '47', change: '+12%', color: 'from-kaboss-500 to-cyan-500' },
  { icon: Users, label: 'Registered Customers', value: '128', change: '+8%', color: 'from-purple-500 to-pink-500' },
  { icon: CalendarCheck, label: 'Active Bookings', value: '12', change: '+3', color: 'from-amber-500 to-orange-500' },
  { icon: MessageSquare, label: 'Unread Messages', value: '5', change: '-2', color: 'from-green-500 to-emerald-500' },
];

const recentBookings = [
  { customer: 'Jean Pierre', service: 'Wedding Invitations', status: 'Pending', date: '2h ago' },
  { customer: 'Alice Uwimana', service: 'Sound System', status: 'Approved', date: '1d ago' },
  { customer: 'David Mugisha', service: 'Graduation Photos', status: 'Completed', date: '2d ago' },
];

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
            <div className="mt-3 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">{stat.change}</span>
              <span className="text-gray-400">vs yesterday</span>
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
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {recentBookings.map((booking, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="font-medium text-sm">{booking.customer}</p>
                  <p className="text-xs text-gray-500">{booking.service}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    booking.status === 'Approved' ? 'bg-kaboss-100 text-kaboss-700 dark:bg-kaboss-900/30 dark:text-kaboss-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {booking.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{booking.date}</p>
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
              { label: 'New Announcement', icon: BarChart3, href: '/admin/announcements' },
              { label: 'Manage Gallery', icon: Eye, href: '/admin/gallery' },
              { label: 'View Messages', icon: MessageSquare, href: '/admin/messages' },
              { label: 'Edit Content', icon: TrendingUp, href: '/admin/content' },
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
