import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Facebook, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/services/api';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.sendContact(form);
      setStatus({
        type: 'success',
        text: 'Message sent successfully! We will get back to you as soon as possible.',
      });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus({
        type: 'error',
        text: 'Sorry, something went wrong. Please try again or reach us directly via phone or WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  };

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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        name="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      name="phone"
                      placeholder="+250 788 882 296"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      name="subject"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      name="message"
                      placeholder="Tell us more about what you need..."
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {status && (
                    <div
                      className={`flex items-start gap-3 p-4 rounded-2xl text-sm ${
                        status.type === 'success'
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
                      }`}
                    >
                      {status.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      )}
                      <span>{status.text}</span>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
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
                    <a href="tel:+250788882296" className="text-sm hover:text-kaboss-600 dark:hover:text-kaboss-400 transition-colors">
                      +250 788 882 296
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-kaboss-500 shrink-0" />
                    <a
                      href="mailto:kabbossimage@gmail.com"
                      className="text-sm hover:text-kaboss-600 dark:hover:text-kaboss-400 transition-colors break-all"
                    >
                      kabbossimage@gmail.com
                    </a>
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
                  <a href="tel:+250788882296" className="text-sm hover:text-kaboss-600 dark:hover:text-kaboss-400 transition-colors">
                    +250 788 882 296 (24/7)
                  </a>
                </div>
              </div>

              <a
                href="https://wa.me/250788882296"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-xl transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>

              <a
                href="https://www.facebook.com/search/top?q=Kaboss%20Image"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-xl transition-all"
              >
                <Facebook className="h-5 w-5" />
                Follow Kaboss Image
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
              <iframe
                src="https://www.google.com/maps?q=Nyamasheke%2C%20Rwanda&output=embed"
                title="KABOSS Inc Location - Nyamasheke, Rwanda"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

