import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FileText, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useQuotes, useUpdateQuoteStatus } from '@/hooks/useQuotes';
import { QuoteForm } from '@/components/quote/QuoteForm';

const statusVariant: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = {
  pending: 'warning',
  approved: 'default',
  'in-progress': 'default',
  accepted: 'success',
  declined: 'secondary',
  completed: 'success',
};

export function DashboardQuotes() {
  const { data, isLoading, error } = useQuotes();
  const quotes = data || [];
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';
  const [showForm, setShowForm] = useState(Boolean(preselectedService));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Quote Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your quote requests</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Close' : 'New Quote Request'}
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <QuoteForm
            defaultServiceId={preselectedService || undefined}
            onSuccess={() => setShowForm(false)}
          />
        </motion.div>
      )}

      {isLoading ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Loading quotes...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-red-500">Failed to load quotes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">No quote requests yet.</p>
            </div>
          ) : (
            quotes.map((quote: any, i: number) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-kaboss-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{quote.serviceName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Requested on {formatDate(new Date(quote.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={statusVariant[quote.status] || 'default'}>
                      {quote.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {quote.details && <p><span className="font-medium">Details:</span> {quote.details}</p>}
                  {quote.budget && <p><span className="font-medium">Budget:</span> {quote.budget}</p>}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

