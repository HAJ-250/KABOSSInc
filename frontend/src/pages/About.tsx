import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Target, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const values = [
  { icon: Heart, title: 'Integrity', desc: 'We conduct our business with honesty and transparency.' },
  { icon: Target, title: 'Excellence', desc: 'We strive for the highest quality in every service we provide.' },
  { icon: Eye, title: 'Innovation', desc: 'We embrace modern technology and creative solutions.' },
];

export function About() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(43,143,255,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                KABOSS Inc
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover our story, mission, and the passion that drives us to serve our community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="text-kaboss-600 dark:text-kaboss-400 font-medium text-sm tracking-wider uppercase">
                Our Story
              </span>
              <h2 className="text-4xl font-bold mt-3 mb-6">
                The{' '}
                <span className="gradient-text">KABOSS</span> Journey
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  KABOSS Inc was founded with a simple vision: to provide the Nyamasheke community with 
                  access to professional, high-quality business services all under one roof.
                </p>
                <p>
                  Located in the heart of Ruharambuga Sector, Ntendezi Cell, Kakiru Village, we have grown 
                  from a small printing shop into a comprehensive multi-service business center serving 
                  hundreds of satisfied clients across Rwanda.
                </p>
                <p>
                  Our team combines years of experience with a passion for excellence, ensuring that every 
                  project — whether it's a wedding invitation, a corporate brochure, or a sound system setup 
                  for a special event — receives the utmost attention to detail and quality.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-kaboss-500/20 to-premium-gold/20 border border-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden">
                <div className="w-full h-full">
                  <img
                    src="/images/profile.jpg"
                    alt="KABOSS Inc Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="py-20 bg-gray-50/50 dark:bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div {...fadeUp} className="p-8 rounded-3xl glass card-hover text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-kaboss-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-500 dark:text-gray-400">
                To provide accessible, high-quality business services that empower individuals and 
                organizations in our community to achieve their goals.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="p-8 rounded-3xl glass card-hover text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-premium-gold to-amber-500 flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-500 dark:text-gray-400">
                To be the leading multi-service business center in Rwanda, recognized for excellence, 
                innovation, and outstanding customer service.
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="p-8 rounded-3xl glass card-hover text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Core Values</h3>
              <ul className="text-gray-500 dark:text-gray-400 space-y-2">
                {values.map((v) => (
                  <li key={v.title} className="flex items-center gap-2 justify-center">
                    <v.icon className="h-4 w-4 text-kaboss-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{v.title}</span>
                    — {v.desc}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Business Hours & Location */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp} className="p-8 rounded-3xl glass">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Clock className="h-6 w-6 text-kaboss-500" />
                Business Hours
              </h3>
              <div className="space-y-3">
                {[
                  { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
                  { day: 'Saturday', hours: '8:00 AM - 6:00 PM' },
                  { day: 'Sunday', hours: '9:00 AM - 2:00 PM' },
                ].map((s) => (
                  <div key={s.day} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="font-medium">{s.day}</span>
                    <span className="text-gray-500 dark:text-gray-400">{s.hours}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="p-8 rounded-3xl glass">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MapPin className="h-6 w-6 text-kaboss-500" />
                Our Location
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-kaboss-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Nyamasheke District</p>
                    <p>Ruharambuga Sector, Ntendezi Cell</p>
                    <p>Kakiru Village, Rwanda</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-kaboss-500 shrink-0" />
                  <span>+250 78 XXX XXXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-kaboss-500 shrink-0" />
                  <span>info@kabossinc.com</span>
                </div>
                <Link to="/contact">
                  <Button className="mt-4">Get Directions</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
