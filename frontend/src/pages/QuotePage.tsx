import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, LogIn, UserPlus, Lock } from 'lucide-react';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { services } from '@/data/services';
import { Button } from '@/components/ui/button';
import { NotFound } from '@/pages/NotFound';
import { useAuth } from '@/context/AuthContext';

export function QuotePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return <NotFound />;
  }

  const redirect = encodeURIComponent(`/services/${service.id}/quote`);

  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(43,143,255,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to={`/services/${service.id}`}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {service.title}
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Request a{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Quote
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tell us about your project and we will get back to you with a personalized quote.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-3xl glass"
          >
            <div className="flex items-center gap-4">
              <div className="aspect-square h-20 w-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{service.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{service.description}</p>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-kaboss-500 border-t-transparent animate-spin" />
            </div>
          ) : user ? (
            <QuoteForm
              defaultServiceId={service.id}
              onSuccess={() => navigate(`/dashboard/quotes`)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-premium-dark/80 shadow-sm overflow-hidden"
            >
              <div className="p-8 md:p-10 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">You need an account to request a quote</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                  Create a free account or sign in to submit your quote request. We'll keep track of
                  your requests and status in your dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={`/login?redirect=${redirect}`} className="flex-1 sm:max-w-xs">
                    <Button size="lg" className="w-full">
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to={`/register?redirect=${redirect}`} className="flex-1 sm:max-w-xs">
                    <Button size="lg" variant="premium" className="w-full">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create an Account
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-8 p-6 rounded-2xl bg-kaboss-50 dark:bg-kaboss-950/30 border border-kaboss-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-kaboss-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                What happens next? Our team will review your request and get back to you with a
                detailed quote. You can track the status of your request in your dashboard.
              </p>
            </div>
          </div>

          <div className="mt-6 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Need it urgently? Reach us directly at{' '}
                <a href="tel:+250788882296" className="font-medium text-kaboss-600 dark:text-kaboss-400">
                  +250 788 882 296
                </a>{' '}
                or email{' '}
                <a href="mailto:kabbossimage@gmail.com" className="font-medium text-kaboss-600 dark:text-kaboss-400">
                  kabbossimage@gmail.com
                </a>
                .
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/services">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

