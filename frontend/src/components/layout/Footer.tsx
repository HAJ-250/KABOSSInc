import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="relative bg-premium-dark text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-kaboss-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
<div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl overflow-hidden ring-2 ring-kaboss-500/30 shadow-lg shadow-kaboss-500/30">
                <img
                  src="/images/kabossinc%20logo.jpg"
                  alt="KABOSS Inc"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-2xl font-bold">KABOSS</span>
                <span className="text-xs text-gray-400 block -mt-1">Inc</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/search/top?q=Kaboss%20Image"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-kaboss-500 hover:text-white transition-all duration-300"
              >
                <span className="text-xs font-medium uppercase">f</span>
              </a>
              <a
                href="https://wa.me/250788882296"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-kaboss-500 hover:text-white transition-all duration-300"
              >
                <span className="text-xs font-medium uppercase">w</span>
              </a>
              <a
                href="mailto:kabossimage@gmail.com"
                aria-label="Email"
                className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-kaboss-500 hover:text-white transition-all duration-300"
              >
                <span className="text-xs font-medium uppercase">@</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {[
                { label: t('nav.home'), href: '/' },
                { label: t('footer.aboutUs'), href: '/about' },
                { label: t('nav.services'), href: '/services' },
                { label: t('nav.gallery'), href: '/gallery' },
                { label: t('nav.partners'), href: '/partners' },
                { label: t('nav.contact'), href: '/contact' },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.ourServices')}</h3>
            <ul className="space-y-3">
              {[
                t('services.cat.printing'),
                t('services.cat.graphicDesign'),
                t('services.cat.photography'),
                t('services.cat.soundSystem'),
                t('services.cat.digitalServices'),
                t('services.cat.iremboAssistance'),
              ].map((service, idx) => (
                <li key={idx}>
                  <Link
                    to="/services"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.contactInfo')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-kaboss-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">
                  {t('footer.address')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-kaboss-400 shrink-0" />
                <a href="tel:+250788882296" className="text-gray-400 text-sm hover:text-white transition-colors">+250 788 882 296</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-kaboss-400 shrink-0" />
                <a href="mailto:kabossimage@gmail.com" className="text-gray-400 text-sm hover:text-white transition-colors">kabossimage@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-kaboss-400 mt-0.5 shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>{t('contact.hours')}</p>
                  <p>{t('contact.hoursSun')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} KABOSS Inc. {t('footer.rights')}
          </p>
          <p className="text-gray-500 text-sm">
            {t('footer.developedBy')} <span className="text-gray-300">HIRWA Aime Jospin</span>
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              {t('footer.termsConditions')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

