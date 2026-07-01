import { motion } from 'framer-motion';
import { Globe, Image, MessageSquare, Users, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  { icon: Globe, label: 'Hero Section', desc: 'Edit homepage hero content', href: '/admin/content/hero', color: 'from-kaboss-500 to-cyan-500' },
  { icon: FileText, label: 'About Page', desc: 'Company story, mission, vision', href: '/admin/content/about', color: 'from-purple-500 to-pink-500' },
  { icon: MessageSquare, label: 'Testimonials', desc: 'Manage client testimonials', href: '/admin/content/testimonials', color: 'from-amber-500 to-orange-500' },
  { icon: Image, label: 'Gallery', desc: 'Manage photos and videos', href: '/admin/gallery', color: 'from-green-500 to-emerald-500' },
  { icon: Users, label: 'Partners', desc: 'Manage partner organizations', href: '/admin/partners', color: 'from-red-500 to-rose-500' },
  { icon: Settings, label: 'Site Settings', desc: 'SEO, contact, social media', href: '/admin/settings', color: 'from-teal-500 to-emerald-500' },
];

export function AdminContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Management</h1>
      <p className="text-gray-500 dark:text-gray-400">Manage every part of your website without editing code</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={section.href} className="block p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover group">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{section.label}</h3>
              <p className="text-sm text-gray-500">{section.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
