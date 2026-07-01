import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const allBookings = [
  { id: 1, customer: 'Jean Pierre', service: 'Wedding Invitations', date: 'Dec 15, 2024', status: 'pending' as const, amount: '25,000 RWF' },
  { id: 2, customer: 'Alice Uwimana', service: 'Sound System', date: 'Jan 20, 2025', status: 'approved' as const, amount: '150,000 RWF' },
  { id: 3, customer: 'David Mugisha', service: 'Photography', date: 'Feb 10, 2025', status: 'completed' as const, amount: '80,000 RWF' },
  { id: 4, customer: 'Grace Mukamana', service: 'Graphic Design', date: 'Feb 15, 2025', status: 'in-progress' as const, amount: '35,000 RWF' },
  { id: 5, customer: 'Patrick H.', service: 'Printing', date: 'Feb 18, 2025', status: 'cancelled' as const, amount: '10,000 RWF' },
];

const statusColors: Record<string, 'warning' | 'default' | 'success' | 'default' | 'secondary'> = {
  pending: 'warning',
  approved: 'default',
  'in-progress': 'default',
  completed: 'success',
  cancelled: 'secondary',
};

export function AdminBookings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all customer bookings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button>Export</Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search bookings..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Service</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.map((booking, i) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-kaboss-500/20 to-kaboss-700/20 flex items-center justify-center text-sm font-medium text-kaboss-600">
                        {booking.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-sm">{booking.customer}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{booking.service}</td>
                  <td className="p-4 text-sm text-gray-500">{booking.date}</td>
                  <td className="p-4 text-sm font-medium">{booking.amount}</td>
                  <td className="p-4">
                    <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                  </td>
                  <td className="p-4">
                    <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
