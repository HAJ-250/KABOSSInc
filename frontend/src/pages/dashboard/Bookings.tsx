import { motion } from 'framer-motion';
import { CalendarCheck, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const bookings = [
  { id: 1, service: 'Wedding Invitations', date: new Date('2024-12-15'), status: 'completed' as const },
  { id: 2, service: 'Sound System - Wedding', date: new Date('2025-01-20'), status: 'approved' as const },
  { id: 3, service: 'Graduation Photography', date: new Date('2025-02-10'), status: 'pending' as const },
];

const statusVariant: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = {
  pending: 'warning',
  approved: 'default',
  'in-progress': 'default',
  completed: 'success',
  cancelled: 'secondary',
};

export function DashboardBookings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your service bookings</p>
        </div>
        <Button>
          <CalendarCheck className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center">
                  <CalendarCheck className="h-6 w-6 text-kaboss-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{booking.service}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(booking.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={statusVariant[booking.status] || 'default'}>
                  {booking.status}
                </Badge>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
