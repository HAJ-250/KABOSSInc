import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Edit3 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-kaboss-100 text-kaboss-700 dark:bg-kaboss-900/30 dark:text-kaboss-400',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statuses = ['pending', 'approved', 'in-progress', 'completed', 'cancelled'];

export function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    apiRequest<any[]>('/admin/bookings').then(setBookings).catch(() => {});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await apiRequest(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
    toast.success('Booking updated');
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    await apiRequest(`/admin/bookings/${id}`, { method: 'DELETE' });
    setBookings((prev) => prev.filter((b) => b._id !== id));
    toast.success('Booking deleted');
  };

  const filtered = bookings.filter((b) =>
    b.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
    b.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
      </div>

      <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Service</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Details</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking, i) => (
                <motion.tr key={booking._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="p-4 text-sm font-medium">{booking.serviceName}</td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{booking.details}</td>
                  <td className="p-4 text-sm text-gray-500">{booking.date ? new Date(booking.date).toLocaleDateString() : '—'}</td>
                  <td className="p-4">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking._id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[booking.status] || ''}`}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteBooking(booking._id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
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
