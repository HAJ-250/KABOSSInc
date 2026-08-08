import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, ArrowRight, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { useBookings } from '@/hooks/useBookings';
import { useInitiatePayment, useConfirmPayment, usePayments } from '@/hooks/usePayments';
import { BookingForm } from '@/components/booking/BookingForm';

const statusVariant: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = {
  pending: 'warning',
  pendingPayment: 'warning',
  pending_payment: 'warning',
  'pending-payment': 'warning',
  approved: 'default',
  'in-progress': 'default',
  in_progress: 'default',
  confirmed: 'default',
  completed: 'success',
  cancelled: 'secondary',
};

export function DashboardBookings() {
  const { data, isLoading, error } = useBookings();
  const bookings = data || [];
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(Boolean(preselectedService));

  // Inline payment state
  const [payBooking, setPayBooking] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const initiatePayment = useInitiatePayment();
  const confirmPayment = useConfirmPayment();
  const { data: payments } = usePayments();

  const newestPendingPayment = (booking: any) => {
    const list = payments || [];
    return list.find(
      (p: any) =>
        String(p.bookingId) === String(booking.id) && p.paymentStatus === 'PENDING'
    );
  };

  const handlePayClick = (booking: any) => {
    setPayBooking(booking);
    setAmount(booking.amount ? String(booking.amount) : '');
    setPhone('');
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payBooking) return;
    await initiatePayment.mutateAsync({
      bookingId: payBooking.id,
      amount: Number(amount),
      phoneNumber: phone,
      paymentMethod: 'MTN_MOMO',
    });
  };

  const pendingPayment = payBooking ? newestPendingPayment(payBooking) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your service bookings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <CalendarCheck className="mr-2 h-4 w-4" />
          {showForm ? 'Close' : 'New Booking'}
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <BookingForm
            defaultServiceId={preselectedService || undefined}
            onSuccess={() => {
              setShowForm(false);
            }}
          />
        </motion.div>
      )}

      {isLoading ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-red-500">Failed to load bookings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">No bookings yet.</p>
            </div>
          ) : (
            bookings.map((booking: any, i: number) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center">
                      <CalendarCheck className="h-6 w-6 text-kaboss-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{booking.serviceName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(new Date(booking.date))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={statusVariant[booking.status] || 'default'}>
                      {booking.status}
                    </Badge>
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                    >
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {expandedId === booking.id && (
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p><span className="font-medium">Details:</span> {booking.details}</p>
                    {booking.time && <p><span className="font-medium">Time:</span> {booking.time}</p>}
                    {booking.location && <p><span className="font-medium">Location:</span> {booking.location}</p>}
                    {booking.amount && (
                      <p className="flex items-center gap-2 mt-2">
                        <span className="font-medium">Amount:</span>
                        <span className="font-bold text-kaboss-600 dark:text-kaboss-400">
                          {Number(booking.amount).toLocaleString()} {booking.amountCurrency || 'RWF'}
                        </span>
                        <Badge variant={booking.paymentStatus === 'SUCCESS' ? 'success' : booking.paymentStatus === 'NO_PAYMENT' ? 'secondary' : 'warning'}>
                          {booking.paymentStatus === 'SUCCESS' ? 'Paid' : booking.paymentStatus}
                        </Badge>
                      </p>
                    )}

                    {/* Payment action */}
                    {booking.paymentStatus !== 'SUCCESS' && booking.status !== 'cancelled' && (
                      <div className="mt-3">
                        {payBooking?.id === booking.id ? (
                          <div className="p-4 rounded-xl bg-kaboss-50 dark:bg-kaboss-950/30 border border-kaboss-500/20">
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-kaboss-500" />
                              Pay this booking via MTN MoMo
                            </h4>
                            {pendingPayment ? (
                              <div className="space-y-3">
                                <p className="text-xs text-gray-500">
                                  A payment request has been sent to your MTN MoMo phone. Approve it on your
                                  phone, then click <span className="font-medium">Check status</span>.
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => confirmPayment.mutate({ paymentId: pendingPayment.id })}
                                    disabled={confirmPayment.isPending}
                                  >
                                    {confirmPayment.isPending ? (
                                      <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Checking...</>
                                    ) : (
                                      <>Check status</>
                                    )}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setPayBooking(null)}>
                                    Close
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <form onSubmit={handleInitiate} className="space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <label className="block text-xs font-medium mb-1">Amount (RWF)</label>
                                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000" required />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium mb-1">MTN MoMo number</label>
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0788882296" required />
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                  A payment request will be sent to your MTN MoMo phone. Approve it to complete the payment.
                                </p>
                                <div className="flex gap-2">
                                  <Button type="submit" size="sm" disabled={initiatePayment.isPending}>
                                    {initiatePayment.isPending ? (
                                      <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Requesting...</>
                                    ) : (
                                      <><CreditCard className="mr-1 h-4 w-4" /> Send Payment Request</>
                                    )}
                                  </Button>
                                  <Button type="button" size="sm" variant="ghost" onClick={() => setPayBooking(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            )}
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => handlePayClick(booking)}>
                            <CreditCard className="mr-1 h-4 w-4" />
                            {booking.paymentStatus === 'PENDING' || booking.paymentStatus === 'pending-payment' ? 'Continue Payment' : 'Pay Now'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
