import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'What services does KABOSS Inc offer?', a: 'We offer printing services, graphic design, photography, sound system rental, digital services, and Irembo assistance. Visit our Services page for full details.', category: 'general' },
  { q: 'Where is KABOSS Inc located?', a: 'We are located in Nyamasheke District, Ruharambuga Sector, Ntendezi Cell, Kakiru Village, Rwanda.', category: 'general' },
  { q: 'What are your business hours?', a: 'Monday to Saturday: 8:00 AM - 6:00 PM, Sunday: 9:00 AM - 2:00 PM.', category: 'general' },
  { q: 'How can I contact KABOSS Inc?', a: 'You can call us at +250 788 882 296, email kabbossimage@gmail.com, chat with us on WhatsApp, or visit our Contact page to send us a message.', category: 'contact' },
  { q: 'Do you offer delivery services?', a: 'Yes, we offer delivery for certain services within Nyamasheke District. Contact us for more details.', category: 'services' },
  { q: 'How long does it take to print invitations?', a: 'Typical turnaround time is 2-3 business days, depending on the quantity and complexity of the design.', category: 'printing' },
  { q: 'Can I request a custom design?', a: 'Absolutely! Our graphic design team can create custom designs tailored to your preferences. Visit our Services page or contact us.', category: 'design' },
  { q: 'Do you offer event photography packages?', a: 'Yes, we offer various photography packages for weddings, graduations, birthdays, and other events.', category: 'photography' },
  { q: 'What sound system equipment do you provide?', a: 'We provide complete sound system solutions including speakers, microphones, mixers, and other audio equipment for events of all sizes.', category: 'sound' },
  { q: 'Can you assist with Irembo services?', a: 'Yes, we help customers access and navigate services available on the Irembo platform. We provide guidance and assistance with the online process.', category: 'irembo' },
  { q: 'What payment methods do you accept?', a: 'We accept cash, mobile money (MTN, Airtel), and bank transfers.', category: 'billing' },
  { q: 'Do you offer bulk printing discounts?', a: 'Yes, we offer competitive pricing and discounts for bulk orders. Contact us for a customized quote.', category: 'printing' },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'printing', label: 'Printing' },
  { id: 'design', label: 'Design' },
  { id: 'photography', label: 'Photography' },
  { id: 'sound', label: 'Sound System' },
  { id: 'irembo', label: 'Irembo' },
  { id: 'contact', label: 'Contact' },
  { id: 'billing', label: 'Billing' },
  { id: 'services', label: 'Services' },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = faqs.filter((faq) => {
    const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Find answers to common questions about our services
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    activeCategory === cat.id
                      ? 'bg-kaboss-500 text-white shadow-lg'
                      : 'glass hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 text-gray-600 dark:text-gray-300'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl glass overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-kaboss-50/50 dark:hover:bg-kaboss-950/30"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300',
                      openIndex === i && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
