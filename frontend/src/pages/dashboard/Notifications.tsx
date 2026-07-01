import { motion } from 'framer-motion';
import { Bell, CalendarCheck, MessageSquare, Download } from 'lucide-react';

const notifications = [
  { icon: CalendarCheck, title: 'Booking Approved', desc: 'Your wedding invitation printing has been approved.', time: '2h ago', color: 'text-green-500' },
  { icon: MessageSquare, title: 'New Message', desc: 'KABOSS Support replied to your message.', time: '1d ago', color: 'text-kaboss-500' },
  { icon: Download, title: 'Files Ready', desc: 'Your graduation photos are ready for download.', time: '2d ago', color: 'text-amber-500' },
];

export function DashboardNotifications() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <p className="text-gray-500 dark:text-gray-400">Stay updated with your activities</p>

      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover"
          >
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <notif.icon className={`h-5 w-5 ${notif.color}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{notif.title}</p>
              <p className="text-sm text-gray-500">{notif.desc}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{notif.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
