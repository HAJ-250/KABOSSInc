import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-premium-dark text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-kaboss-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center shadow-lg shadow-kaboss-500/30">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <span className="text-2xl font-bold">KABOSS</span>
                <span className="text-xs text-gray-400 block -mt-1">Inc</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted multi-service business center in Nyamasheke, Rwanda. 
              We provide premium printing, design, photography, sound system, and digital services.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'whatsapp', 'email'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-kaboss-500 hover:text-white transition-all duration-300"
                >
                  <span className="text-xs font-medium uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Gallery', href: '/gallery' },
                { label: 'Partners', href: '/partners' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
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
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {[
                'Printing Services',
                'Graphic Design',
                'Photography',
                'Sound System',
                'Digital Services',
                'Irembo Assistance',
              ].map((service) => (
                <li key={service}>
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
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-kaboss-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">
                  Nyamasheke District, Ruharambuga Sector, Ntendezi Cell, Kakiru Village, Rwanda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-kaboss-400 shrink-0" />
                <span className="text-gray-400 text-sm">+250 78 XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-kaboss-400 shrink-0" />
                <span className="text-gray-400 text-sm">info@kabossinc.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-kaboss-400 mt-0.5 shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>Mon - Sat: 8:00 AM - 6:00 PM</p>
                  <p>Sun: 9:00 AM - 2:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} KABOSS Inc. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Developed by <span className="text-gray-300">HIRWA Aime Jospin</span>
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
