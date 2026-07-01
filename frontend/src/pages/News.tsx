import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const posts = [
  {
    id: 1, title: 'New Printing Services Available', excerpt: 'We have expanded our printing capabilities with new high-speed digital printers for faster turnaround times.',
    date: new Date('2024-10-15'), category: 'Services', tags: ['printing', 'announcement'], image: 'https://placehold.co/800x500/1a1a2e/ffffff?text=News+1',
  },
  {
    id: 2, title: 'Holiday Promotion - 20% Off All Printing', excerpt: 'Celebrate the holiday season with special discounts on all our printing services. Limited time offer!',
    date: new Date('2024-12-01'), category: 'Promotions', tags: ['promotion', 'printing'], image: 'https://placehold.co/800x500/1a1a2e/ffffff?text=News+2',
  },
  {
    id: 3, title: 'New Photography Studio Opening', excerpt: 'We are excited to announce the opening of our new professional photography studio with state-of-the-art equipment.',
    date: new Date('2024-11-20'), category: 'Announcements', tags: ['photography', 'studio'], image: 'https://placehold.co/800x500/1a1a2e/ffffff?text=News+3',
  },
];

export function News() {
  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Latest{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                News & Updates
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay informed about our latest services, promotions, and company news
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-3xl glass overflow-hidden card-hover"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(post.date)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-kaboss-100 dark:bg-kaboss-900/50 text-kaboss-600 dark:text-kaboss-400 text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-kaboss-600 dark:group-hover:text-kaboss-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-gray-400">
                        <Tag className="h-3 w-3" />#{tag}
                      </span>
                    ))}
                  </div>
                  <Link to="#" className="inline-flex items-center gap-2 text-kaboss-600 dark:text-kaboss-400 text-sm font-medium group/link">
                    Read More <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
