import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Quote as QuoteIcon,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { services } from '@/data/services';
import { useAuth } from '@/context/AuthContext';
import { NotFound } from '@/pages/NotFound';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return <NotFound />;
  }

  const handleBook = () => {
    if (!user) {
      const redirect = encodeURIComponent(`/dashboard/bookings?service=${service.id}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    navigate(`/dashboard/bookings?service=${service.id}`);
  };

  const handleQuote = () => {
    if (!user) {
      const redirect = encodeURIComponent(`/services/${service.id}/quote`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    navigate(`/services/${service.id}/quote`);
  };

  const otherServices = services.filter((s) => s.id !== service.id);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(43,143,255,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              All Services
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                <service.icon className="h-8 w-8 text-white" />
              </div>
              <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-gray-300 uppercase tracking-wide">
                {service.category.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {service.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
              {service.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div {...fadeUp} className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </motion.div>

            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                What We <span className="gradient-text">Offer</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {service.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-kaboss-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="xl" onClick={handleQuote}>
                  <QuoteIcon className="mr-2 h-5 w-5" />
                  Request a Quote
                </Button>
                <Button size="xl" variant="outline" onClick={handleBook}>
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Book This Service
                </Button>
              </div>
              {!user && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  You need an account to book a service or request a quote.{' '}
                  <Link to="/login" className="text-kaboss-500 hover:underline font-medium">
                    Sign in
                  </Link>{' '}
                  or{' '}
                  <Link to="/register" className="text-kaboss-500 hover:underline font-medium">
                    create an account
                  </Link>
                  .
                </p>
              )}
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            {...fadeUp}
            className="p-10 rounded-3xl bg-gradient-to-br from-premium-dark to-premium-navy text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(43,143,255,0.3) 0%, transparent 50%)`,
              }}
            />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to get started with {service.title}?
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                Contact us directly for personalized assistance or explore our other services.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact">
                  <Button variant="secondary" size="xl">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Talk to Us
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="premium" size="xl">
                    View All Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Other services */}
      <section className="py-20 bg-gray-50/50 dark:bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Explore Other <span className="gradient-text">Services</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherServices.slice(0, 6).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/services/${s.id}`} className="group block h-full">
                  <div className="relative h-full rounded-2xl overflow-hidden glass border border-transparent hover:border-kaboss-500/20 transition-all duration-500 card-hover">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-kaboss-500 transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {s.description}
                      </p>
                      <div className="flex items-center text-kaboss-600 dark:text-kaboss-400 text-sm font-medium group-hover:gap-2 transition-all">
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

