import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { services } from '@/data/services';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/context/AuthContext';

interface BookingFormProps {
  onSuccess?: () => void;
  defaultServiceId?: string;
}

export function BookingForm({ onSuccess, defaultServiceId }: BookingFormProps) {
  const [serviceId, setServiceId] = useState(defaultServiceId || '');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const createBooking = useCreateBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    const selectedService = services.find(s => s.id === serviceId);
    const booking = await createBooking.mutateAsync({
      serviceId,
      serviceName: selectedService?.title || '',
      details,
      date,
      time,
    });
    setCreatedBooking(booking);
    if (onSuccess) onSuccess();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CalendarCheck className="h-5 w-5 text-kaboss-500" />
        Book a Service
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
            className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-premium-dark/80 px-4 text-sm focus:ring-2 focus:ring-kaboss-500/20 focus:border-kaboss-500"
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Time</label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Details</label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe what you need..."
            required
          />
        </div>
<Button type="submit" disabled={createBooking.isPending} className="w-full">
          {createBooking.isPending ? 'Submitting...' : 'Submit Booking'}
        </Button>
      </form>

      {createdBooking && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 border border-kaboss-500/20"
        >
          <h4 className="font-semibold flex items-center gap-2 mb-1">
            <CreditCard className="h-5 w-5 text-kaboss-500" />
            Booking created — ready to pay?
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Your booking for "{createdBooking.serviceName}" has been submitted. You can pay for it now
            using MTN MoMo to get started sooner.
          </p>
          <Button
            onClick={() => navigate(`/dashboard/bookings`)}
            className="w-full"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Go to Bookings to Pay
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
