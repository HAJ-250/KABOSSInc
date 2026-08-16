import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Clock, Users, Award, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useTranslatedServices } from '@/hooks/useTranslatedServices';
import { useI18n } from '@/i18n';
import { resolveImageUrl } from '@/lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

type GalleryItem = { url: string; category?: string };

export function Home() {
  const { t } = useI18n();
  const translatedServices = useTranslatedServices();
  const heroRef = useRef<HTMLDivElement>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);

  const stats = [
    { icon: Users, value: 500, suffix: '+', label: t('home.stats.happyClients') },
    { icon: Award, value: 6, suffix: '+', label: t('home.stats.yearsExperience') },
    { icon: CheckCircle, value: 1000, suffix: '+', label: t('home.stats.projectsDone') },
    { icon: Clock, value: 99, suffix: '%', label: t('home.stats.clientSatisfaction') },
  ];

  const testimonials = [
    { name: 'Jean Pierre', role: t('testimonials.t1role') || 'Business Owner', content: t('testimonials.t1'), rating: 5 },
    { name: 'Alice Uwimana', role: t('testimonials.t2role') || 'Event Planner', content: t('testimonials.t2') || '', rating: 5 },
    { name: 'David Mugisha', role: t('testimonials.t3role') || 'Graduate', content: t('testimonials.t3'), rating: 5 },
  ];

  const whyUs = [
    { title: t('home.whyUs[0].title'), desc: t('home.whyUs[0].desc') },
    { title: t('home.whyUs[1].title'), desc: t('home.whyUs[1].desc') },
    { title: t('home.whyUs[2].title'), desc: t('home.whyUs[2].desc') },
    { title: t('home.whyUs[3].title'), desc: t('home.whyUs[3].desc') },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load the admin-uploaded gallery images (same source as the navbar gallery)
  useEffect(() => {
    let mounted = true;
    fetch('/api/gallery')
      .then((r) => r.json().catch(() => ({})))
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data?.galleryImages) ? data.galleryImages : [];
        setGalleryImages(list);
      })
      .catch(() => {
        if (mounted) setGalleryImages([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(43,143,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(212,175,55,0.2) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-6"
              >
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {t('home.welcome')}
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {t('home.heroTitle1')}{' '}
                <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                  {t('home.heroTitleHighlight')}
                </span>{' '}
                {t('home.heroTitle2')}
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
                {t('home.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/services">
                  <Button size="xl" className="group">
                    {t('home.exploreServices')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="secondary" size="xl">
                    {t('home.contactUs')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-kaboss-500/30 to-premium-gold/20 rounded-3xl blur-3xl" />
                <div className="relative w-full h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                  <img
                     src={resolveImageUrl('/uploads/profile/1783354105972-bbf27ec5555f78.jpg')}
                    alt="KABOSS Inc"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-center">
                    <h3 className="text-2xl font-bold text-white">KABOSS Inc</h3>
                    <p className="text-gray-300 mt-1">Nyamasheke, Rwanda</p>
                  </div>
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-gradient-to-br from-premium-gold to-amber-500 flex items-center justify-center shadow-2xl"
                  animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-3xl">⭐</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-premium-dark to-transparent" />
      </section>

      {/* Stats */}
      <section className="relative -mt-20 z-10 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl glass-strong"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <stat.icon className="h-8 w-8 text-kaboss-500 mx-auto mb-3" />
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-kaboss-600 dark:text-kaboss-400 font-medium text-sm tracking-wider uppercase">
              {t('home.whatWeOffer')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              {t('home.ourServices')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              {t('home.servicesSubtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {translatedServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/services/${service.id}`} className="group block h-full">
                  <div className="relative h-full p-6 rounded-2xl glass border border-transparent hover:border-kaboss-500/20 transition-all duration-500 card-hover">
                    <div className="mb-4 aspect-[16/9] rounded-xl overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <service.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.items.slice(0, 4).map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-kaboss-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                      {service.items.length > 4 && (
                        <li className="text-sm text-kaboss-500 font-medium">
                          +{service.items.length - 4} {t('home.moreServices')}
                        </li>
                      )}
                    </ul>
                    <div className="mt-4 flex items-center text-kaboss-600 dark:text-kaboss-400 text-sm font-medium group-hover:gap-2 transition-all">
                      {t('buttons.learnMore')} <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50/50 dark:bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="text-kaboss-600 dark:text-kaboss-400 font-medium text-sm tracking-wider uppercase">
                {t('home.whyKabboss')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
                {t('home.whyChoose')}{' '}
                <span className="gradient-text">{t('home.whyChooseHighlight')}</span>
              </h2>
              <div className="space-y-6">
                {whyUs.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-6 w-6 text-kaboss-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl border border-white/20 backdrop-blur-xl overflow-hidden">
                <img
                   src={resolveImageUrl('/uploads/profile/1783354105972-bbf27ec5555f78.jpg')}
                  alt="KABOSS Inc - Nyamasheke, Rwanda"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-center">
                  <h3 className="text-2xl font-bold">Nyamasheke, Rwanda</h3>
                  <p className="text-gray-300 mt-1">{t('home.servingCommunity')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-kaboss-600 dark:text-kaboss-400 font-medium text-sm tracking-wider uppercase">
              {t('home.testimonials')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              {t('home.whatClientsSay')}{' '}
              <span className="gradient-text">{t('home.clientsSayHighlight')}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tt, i) => (
              <motion.div
                key={tt.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: tt.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-premium-gold text-premium-gold" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">"{tt.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white font-semibold text-sm">
                    {tt.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{tt.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{tt.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-gray-50/50 dark:bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-kaboss-600 dark:text-kaboss-400 font-medium text-sm tracking-wider uppercase">
              {t('home.ourWork')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              {t('home.exploreGallery')}{' '}
              <span className="gradient-text">{t('home.galleryHighlight')}</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              {t('home.gallerySubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((item, i) => {
              const src = (typeof item === 'string' ? item : item?.url) || '';
              const rawLabel = typeof item === 'string' ? (i % 2 === 0 ? t('home.printing') : t('home.photography')) : item?.category || t('home.project');
              const label = rawLabel === 'printing' ? t('home.printing') : rawLabel === 'photography' ? t('home.photography') : item?.category ? t('gallery.' + (item.category || 'others')) || rawLabel : rawLabel;
              return (
                <motion.div
                  key={(src || `img-${i}`) + i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={resolveImageUrl(src)}
                    alt={`${t('home.project')} ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 flex items-center gap-2 text-white text-sm font-medium capitalize">
                      <ImageIcon className="h-4 w-4" />
                      {label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/gallery">
              <Button size="lg" className="group">
                {t('home.viewFullGallery')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 premium-gradient opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('home.readyToStart')}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button variant="secondary" size="xl">
                  {t('home.getInTouch')}
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="premium" size="xl">
                  {t('home.viewServices')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
