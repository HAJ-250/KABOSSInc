import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const partners = [
  { name: 'Bank of Kigali', description: 'Leading commercial bank in Rwanda providing financial services.', logo: 'BK' },
  { name: 'Equity Bank Rwanda', description: 'Pan-African banking group committed to empowering communities.', logo: 'EB' },
  { name: 'Rwanda Revenue Authority', description: 'Government body responsible for tax administration in Rwanda.', logo: 'RRA' },
  { name: 'MTN Rwanda', description: 'Leading telecommunications company in Rwanda.', logo: 'MTN' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export function Partners() {
  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Partners
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Trusted organizations we work with to serve you better
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-3xl glass card-hover"
              >
                <div className="flex items-start gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-kaboss-500/20 to-premium-gold/20 border border-kaboss-500/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold gradient-text">{partner.logo}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{partner.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{partner.description}</p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 text-kaboss-600 dark:text-kaboss-400 text-sm font-medium hover:gap-3 transition-all"
                    >
                      Visit Website <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
