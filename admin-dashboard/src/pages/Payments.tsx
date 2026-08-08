import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
};

const methodLabels: Record<string, string> = {
  MTN_MOMO: 'MTN MoMo',
  AIRTEL_MONEY: 'Airtel Money',
  BANK: 'Bank',
  CASH: 'Cash',
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sandbox, setSandbox] = useState<boolean | null>(null);

  const load = () => {
    setLoading(true);
    apiRequest<any[]>('/payments/admin/all')
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setPayments(arr);
        // detect sandbox via a sample payment
        setSandbox(null);
      })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Totals
  const totalRevenue = payments
    .filter((p) => p.paymentStatus === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const successful = payments.filter((p) => p.paymentStatus === 'SUCCESS').length;
  const pending = payments.filter((p) => p.paymentStatus === 'PENDING').length;

  const filtered = payments.filter((p) =>
    `${p.phoneNumber} ${p.transactionId} ${p.externalReference} ${p.amount}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor all MTN MoMo transactions</p>
        </div>
        <button onClick={load} className="text-sm px-4 py-2 rounded-xl bg-kaboss-500 text-white hover:bg-kaboss-600 transition-colors flex items-center gap-2">
          <Loader2 className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl font-bold mt-1">{totalRevenue.toLocaleString()} RWF</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-bold text-green-500 mt-1">{successful}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{pending}</p>
        </div>
      </div>

      {sandbox === true && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Payments are in <span className="font-medium">test/sandbox mode</span>. No real money is moved.
          </p>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
      </div>

      {loading ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Loading payments...</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Reference</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-gray-500">No payments found.</td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="p-4 text-sm font-semibold">{Number(p.amount).toLocaleString()} {p.currency || 'RWF'}</td>
                      <td className="p-4 text-sm text-gray-500">{p.phoneNumber}</td>
                      <td className="p-4 text-sm text-gray-500">{methodLabels[p.paymentMethod] || p.paymentMethod}</td>
                      <td className="p-4 text-sm text-gray-500 font-mono">{p.externalReference || p.transactionId}</td>
                      <td className="p-4 text-sm text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusColors[p.paymentStatus] || ''}`}>
                          {p.paymentStatus === 'SUCCESS' ? <CheckCircle2 className="h-3 w-3" /> : p.paymentStatus === 'PENDING' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          {p.paymentStatus}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
