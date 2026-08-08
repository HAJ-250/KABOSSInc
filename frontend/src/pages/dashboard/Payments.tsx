import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, Smartphone, CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { usePayments, useInitiatePayment, useConfirmPayment } from '@/hooks/usePayments';
import { useBookings } from '@/hooks/useBookings';

const statusVariant: Record<string, 'default' | 'warning' | 'success' | 'secondary' | 'destructive'> = {
  PENDING: 'warning',
  SUCCESS: 'success',
  FAILED: 'destructive',
  CANCELLED: 'secondary',
};

export function DashboardPayments() {
  const { data: payments, isLoading: paymentsLoading, error: paymentsError } = usePayments();
  const { data: bookings } = useBookings();
  const initiatePayment = useInitiatePayment();
  const confirmPayment = useConfirmPayment();

  const list = payments || [];
  const pendingBookings = (bookings || []).filter(
    (b: any) => b.paymentStatus !== 'SUCCESS' && b.status !== 'cancelled'
  );

  // Initiate form state
  const [payBookingId, setPayBookingId] = useState<string | number | null>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payBookingId) return;
    await initiatePayment.mutateAsync({
      bookingId: payBookingId,
      amount: Number(amount),
      phoneNumber: phone,
      paymentMethod: 'MTN_MOMO',
    });
    setPhone('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Pay for your KABOSS Inc bookings with MTN MoMo</p>
        </div>
      </div>

      {/* Sandbox notice */}
      <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Payments are currently in <span className="font-medium">test/sandbox mode</span>. No real money is
          moved. A simulated MTN MoMo request will be sent and automatically marked successful.
        </p>
      </div>

      {/* Pending bookings prompt */}
      {pendingBookings.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-kaboss-500" />
            Bookings requiring payment
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {pendingBookings.map((b: any) => (
              <div key={b.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{b.serviceName}</p>
                    <p className="text-xs text-gray-500">{formatDate(new Date(b.date))}</p>
                  </div>
                  <Badge variant={b.paymentStatus === 'NO_PAYMENT' ? 'secondary' : 'warning'}>
                    {b.paymentStatus === 'NO_PAYMENT' ? 'Not Paid' : b.paymentStatus}
                  </Badge>
                </div>
                {b.amount ? (
                  <p className="text-lg font-bold text-kaboss-600 dark:text-kaboss-400">
                    {Number(b.amount).toLocaleString()} {b.amountCurrency || 'RWF'}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">
                    No price set yet. Ask KABOSS Inc to quote a price for this booking, then pay here.
                  </p>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!b.amount}
                  onClick={() => {
                    setPayBookingId(b.id);
                    setAmount(b.amount ? String(b.amount) : '');
                  }}
                >
                  <CreditCard className="mr-1 h-4 w-4" /> Pay Now
                </Button>
              </div>
            ))}
          </div>

          {/* Initiate MTN MoMo form */}
          {payBookingId && (
            <div className="mt-4 p-4 rounded-xl bg-kaboss-50 dark:bg-kaboss-950/30 border border-kaboss-500/20">
              <h4 className="font-medium text-sm mb-3">Pay via MTN MoMo</h4>
              <form onSubmit={handleInitiate} className="space-y-3 max-w-md">
                <div>
                  <label className="block text-xs font-medium mb-1">Amount (RWF)</label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Your MTN MoMo number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0788882296" required />
                </div>
                <p className="text-xs text-gray-500">
                  A payment request will be sent to your MTN MoMo phone. Approve it to complete the payment.
                </p>
                <div className="flex gap-2">
                  <Button type="submit" disabled={initiatePayment.isPending} size="sm">
                    {initiatePayment.isPending ? (
                      <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Requesting...</>
                    ) : (
                      <>Send Payment Request</>
                    )}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPayBookingId(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Payment history */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Payment History</h2>
        {paymentsLoading ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">Loading payments...</p>
          </div>
        ) : paymentsError ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-red-500">Failed to load payments.</p>
          </div>
        ) : list.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">No payments yet. Select a booking above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center">
                      {p.paymentStatus === 'SUCCESS' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : p.paymentStatus === 'FAILED' || p.paymentStatus === 'CANCELLED' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-kaboss-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {Number(p.amount).toLocaleString()} {p.currency || 'RWF'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(new Date(p.createdAt))} · {p.paymentMethod === 'MTN_MOMO' ? 'MTN MoMo' : p.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[p.paymentStatus] || 'default'}>
                      {p.paymentStatus}
                    </Badge>
                    {p.paymentStatus === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmPayment.mutate({ paymentId: p.id })}
                        disabled={confirmPayment.isPending}
                      >
                        <RefreshCw className="mr-1 h-3.5 w-3.5" /> Check
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
