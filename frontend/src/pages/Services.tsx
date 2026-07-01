import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, BookOpen, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { services, serviceCategories } from '@/data/services';
import { cn } from '@/lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export function Services() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) setActiveCategory(hash);
  }, [location.hash]);

  const filtered = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category === activeCategory);

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
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive business solutions tailored to meet your every need
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <motion.div {...fadeUp} className="flex flex-wrap gap-3 mb-12 justify-center">
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                  activeCategory === cat.id
                    ? 'bg-kaboss-500 text-white shadow-lg shadow-kaboss-500/25'
                    : 'glass hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 text-gray-600 dark:text-gray-300'
                )}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Services Grid */}
          <div className="space-y-24">
            {filtered.map((service, index) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="scroll-mt-24"
              >
                <div className={cn('p-8 md:p-12 rounded-3xl', service.gradient)}>
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className={cn('h-16 w-16 rounded-2xl bg-gradient-to-br', service.color, 'flex items-center justify-center mb-6')}>
                        <service.icon className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{service.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{service.description}</p>
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {service.items.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-kaboss-500 shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Request Quote
                        </Button>
                        <Button variant="outline">
                          Book Service
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className={cn('aspect-square rounded-2xl bg-gradient-to-br', service.color, 'opacity-20')} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <service.icon className="h-32 w-32 text-gray-300 dark:text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 premium-gradient opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Need a Custom Solution?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Contact us for personalized service packages tailored to your specific requirements.
            </p>
            <Link to="/contact">
              <Button variant="secondary" size="xl">
                Talk to Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
