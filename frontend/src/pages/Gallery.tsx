import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, resolveImageUrl } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'printing', label: 'Printing' },
  { id: 'design', label: 'Design' },
  { id: 'photography', label: 'Photography' },
  { id: 'events', label: 'Events' },
  { id: 'studio', label: 'Studio' },
  { id: 'others', label: 'Others' },
];

type GalleryItem = {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
};

type BackendGalleryItem = {
  url: string;
  category?: string;
};

// Human-friendly label lookup for categories
const categoryLabels: Record<string, string> = {
  printing: 'Printing',
  design: 'Design',
  photography: 'Photography',
  events: 'Events',
  studio: 'Studio',
  others: 'Others',
};

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [lightboxId, setLightboxId] = useState<number | null>(null);
  const [images, setImages] = useState<BackendGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

async function run() {
      try {
        setLoading(true);
        const res = await fetch('/api/gallery');
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.galleryImages) ? data.galleryImages : [];
        if (!mounted) return;
        setImages(list);
      } catch {
        if (!mounted) return;
        setImages([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  // Build gallery items from the backend, using the real category when available
  // (falling back to an index-based category only when the backend returns plain strings).
  const galleryItems = useMemo<GalleryItem[]>(() => {
    const categoryPool = categories.filter((c) => c.id !== 'all');
    return images.map((item, i) => {
      const url = typeof item === 'string' ? item : item?.url;
      const rawCategory = typeof item === 'string' ? undefined : item?.category;
      const cat = rawCategory
        ? categoryPool.find((c) => c.id === rawCategory)?.id ?? 'others'
        : categoryPool[i % categoryPool.length]?.id ?? 'others';
      return {
        id: i + 1,
        title: rawCategory
          ? `${categoryLabels[cat] ?? 'Project'} ${i + 1}`
          : `Project ${i + 1}`,
        category: cat,
        image: url,
        description: 'Professional service delivered with excellence.',
      };
    });
  }, [images]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return galleryItems.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch = q.length === 0 || item.title.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
}, [activeCategory, galleryItems, search]);

  const lightboxItem = lightboxId == null ? null : filtered.find((i) => i.id === lightboxId) ?? null;

  // Slideshow auto-advance: when the lightbox is open, cycle to the next image every 3.5s
  useEffect(() => {
    if (lightboxId === null || filtered.length <= 1) return;
    const timer = setInterval(() => {
      setLightboxId((currentId) => {
        if (currentId === null) return currentId;
        const idx = filtered.findIndex((i) => i.id === currentId);
        if (idx === -1) return currentId;
        const next = filtered[(idx + 1) % filtered.length];
        return next?.id ?? currentId;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [lightboxId, filtered]);

  return (
    <div className="pt-20">
      <section className="relative py-32 overflow-hidden app-bg-image-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-kaboss-400 to-premium-gold bg-clip-text text-transparent">
                Gallery
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our portfolio of completed projects and services
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'px-5 py-2 rounded-xl text-sm font-medium transition-all',
                    activeCategory === cat.id
                      ? 'bg-kaboss-500 text-white shadow-lg'
                      : 'glass hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 text-gray-600 dark:text-gray-300'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search gallery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group cursor-pointer"
                  onClick={() => setLightboxId(item.id)}
                >
<div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading gallery...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No gallery images uploaded yet.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxId(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setLightboxId(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                const idx = filtered.findIndex((i) => i.id === lightboxItem.id);
                if (idx > 0) setLightboxId(filtered[idx - 1].id);
              }}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <motion.img
              key={lightboxItem.id}
              initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
              src={resolveImageUrl(lightboxItem.image)}
              alt=""
              className="max-h-[85vh] max-w-full rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                const idx = filtered.findIndex((i) => i.id === lightboxItem.id);
                if (idx < filtered.length - 1) setLightboxId(filtered[idx + 1].id);
              }}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
