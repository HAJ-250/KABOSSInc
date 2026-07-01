import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { services } from '@/data/services';
import { useCreateBooking } from '@/hooks/useBookings';

interface BookingFormProps {
  onSuccess?: () => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [serviceId, setServiceId] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const createBooking = useCreateBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = services.find(s => s.id === serviceId);
    await createBooking.mutateAsync({
      serviceId,
      serviceName: selectedService?.title || '',
      details,
      date,
      time,
    });
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
    </motion.div>
  );
}
