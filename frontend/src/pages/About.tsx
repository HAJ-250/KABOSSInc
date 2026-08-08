import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Target, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export function About() {
  const { t } = useI18n();

  const values = [
    { icon: Heart, title: t('about.values[0].title'), desc: t('about.values[0].desc') },
    { icon: Target, title: t('about.values[1].title'), desc: t('about.values[1].desc') },
    { icon: Eye, title: t('about.values[2].title'), desc: t('about.values[2].desc') },
  ];
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
              {t('about.title')}{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                {t('about.highlight')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('about.subtitle')}
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
                {t('about.ourStory')}
              </span>
              <h2 className="text-4xl font-bold mt-3 mb-6">
                {t('about.journey')}{' '}
                <span className="gradient-text">{t('about.journeyHighlight')}</span>
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>{t('about.story1')}</p>
                <p>{t('about.story2')}</p>
                <p>{t('about.story3')}</p>
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
                    src="/uploads/profile/1783354105972-bbf27ec5555f78.jpg"
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
<h3 className="text-2xl font-bold mb-4">{t('about.mission')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('about.missionText')}
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="p-8 rounded-3xl glass card-hover text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-premium-gold to-amber-500 flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('about.vision')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('about.visionText')}
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="p-8 rounded-3xl glass card-hover text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('about.coreValues')}</h3>
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
                {t('about.businessHours')}
              </h3>
              <div className="space-y-3">
{[
                  { day: t('about.dayMonFri'), hours: t('about.hoursMonFri') },
                  { day: t('about.daySat'), hours: t('about.hoursSat') },
                  { day: t('about.daySun'), hours: t('about.hoursSun') },
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
                {t('about.ourLocation')}
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-kaboss-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{t('footer.address')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-kaboss-500 shrink-0" />
                  <a href="tel:+250788882296" className="hover:text-kaboss-600 dark:hover:text-kaboss-400 transition-colors">+250 788 882 296</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-kaboss-500 shrink-0" />
                  <a href="mailto:kabbossimage@gmail.com" className="hover:text-kaboss-600 dark:hover:text-kaboss-400 transition-colors">kabbossimage@gmail.com</a>
                </div>
                <Link to="/contact">
                  <Button className="mt-4">{t('about.getDirections')}</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
