import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { services } from '@/data/services';
import { useCreateQuote } from '@/hooks/useQuotes';
import { useAuth } from '@/context/AuthContext';

interface QuoteFormProps {
  defaultServiceId?: string;
  onSuccess?: () => void;
}

export function QuoteForm({ defaultServiceId, onSuccess }: QuoteFormProps) {
  const [serviceId, setServiceId] = useState(defaultServiceId || '');
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');
  const createQuote = useCreateQuote();
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
    const selectedService = services.find((s) => s.id === serviceId);
    await createQuote.mutateAsync({
      serviceId,
      serviceName: selectedService?.title || '',
      budget,
      details,
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
        <FileText className="h-5 w-5 text-kaboss-500" />
        Request a Quote
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
        <div>
          <label className="block text-sm font-medium mb-2">Budget (optional)</label>
          <Input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 50,000 - 100,000 RWF"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Project Details</label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the project you need a quote for..."
            required
          />
        </div>
        <Button type="submit" disabled={createQuote.isPending} className="w-full">
          {createQuote.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Quote Request
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}

