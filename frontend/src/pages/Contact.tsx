import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export function Contact() {
  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Get In{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We would love to hear from you. Reach out with any questions or requests.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div {...fadeUp} className="lg:col-span-2">
              <div className="p-8 rounded-3xl glass">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input placeholder="+250 78X XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea placeholder="Tell us more about what you need..." />
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="space-y-6">
              <div className="p-6 rounded-2xl glass">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-kaboss-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>Nyamasheke District</p>
                      <p>Ruharambuga Sector, Ntendezi Cell</p>
                      <p>Kakiru Village, Rwanda</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-kaboss-500 shrink-0" />
                    <span className="text-sm">+250 78 XXX XXXX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-kaboss-500 shrink-0" />
                    <span className="text-sm">info@kabossinc.com</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-kaboss-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>Mon - Sat: 8:00 AM - 6:00 PM</p>
                      <p>Sun: 9:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass">
                <h3 className="font-semibold mb-4">Emergency Contact</h3>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-red-500 shrink-0" />
                  <span className="text-sm">+250 78 XXX XXXX (24/7)</span>
                </div>
              </div>

              <a
                href="https://wa.me/25078XXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-xl transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="py-20 bg-gray-50/50 dark:bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-8 text-center">
              Find Us on{' '}
              <span className="gradient-text">Google Maps</span>
            </h2>
            <div className="aspect-[21/9] rounded-3xl overflow-hidden glass">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-kaboss-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Google Maps Integration
                  </p>
                  <p className="text-sm text-gray-400">Nyamasheke, Rwanda</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
