import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Jean Pierre', role: 'Business Owner', content: 'KABOSS Inc delivered exceptional printing services for my business. The quality and professionalism exceeded my expectations. I highly recommend them for any printing needs.', rating: 5 },
  { name: 'Alice Uwimana', role: 'Event Planner', content: 'Their sound system service made our wedding ceremony perfect. Highly professional team with top-notch equipment. The sound quality was outstanding!', rating: 5 },
  { name: 'David Mugisha', role: 'Graduate', content: 'Best graphic design services in Nyamasheke! My graduation invitations were stunning. Thank you KABOSS for making my day special.', rating: 5 },
  { name: 'Grace Mukamana', role: 'Teacher', content: 'I use KABOSS for all my printing needs. They are reliable, affordable, and always deliver on time. Great customer service!', rating: 5 },
  { name: 'Patrick Habimana', role: 'Small Business Owner', content: 'The photography service was amazing. They captured every moment perfectly. Very professional and friendly team.', rating: 5 },
  { name: 'Sarah Uwase', role: 'Bride', content: 'Thank you KABOSS for the beautiful wedding invitations! They were exactly what we wanted. The design was perfect and the quality was superb.', rating: 5 },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export function Testimonials() {
  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Client{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Testimonials
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              What our clients say about our services
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-3xl glass card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-premium-gold text-premium-gold" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white font-semibold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t.role}</p>
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
