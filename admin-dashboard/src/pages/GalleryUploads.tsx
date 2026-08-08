import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getToken, resolveImageUrl } from '../lib/api';

const CATEGORIES = [
  { id: 'printing', label: 'Printing' },
  { id: 'design', label: 'Design' },
  { id: 'photography', label: 'Photography' },
  { id: 'events', label: 'Events' },
  { id: 'studio', label: 'Studio' },
  { id: 'others', label: 'Others' },
];

type GalleryItem = { url: string; category: string };
type ImgList = { galleryImages: GalleryItem[] };

function toItem(item: any): GalleryItem {
  if (typeof item === 'string') return { url: item, category: 'others' };
  return { url: item?.url || '', category: item?.category || 'others' };
}

export function GalleryUploadsPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/images', {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    })
      .then((r) => r.json())
      .then((data: any) => {
        if (!mounted) return;
        setImages(Array.isArray(data?.galleryImages) ? data.galleryImages.map(toItem) : []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const onPick = (f: FileList | null) => {
    if (!f) return;
    setFiles(Array.from(f));
    // Reset category selection when new files are picked
    setCategories({});
  };

  const upload = async () => {
    if (!files.length) return toast.error('Pick images first');
    try {
      const form = new FormData();
      files.forEach((f) => form.append('images', f));
      // Send the per-file category map
      form.append('categories', JSON.stringify(categories));

      const token = getToken();
      const res = await fetch('/api/admin/upload/gallery', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      const data: ImgList = await res.json();
      if (!res.ok) throw new Error((data as any)?.error || 'Upload failed');

      setImages((Array.isArray(data.galleryImages) ? data.galleryImages : []).map(toItem));
      setFiles([]);
      setCategories({});
      toast.success('Gallery updated');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    }
  };

  const del = async (url: string) => {
    try {
      const filename = url.split('/').pop();
      if (!filename) return;
      const token = getToken();
      const res = await fetch(`/api/admin/gallery/${filename}`, {

        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      setImages((Array.isArray(data.galleryImages) ? data.galleryImages : []).map(toItem));
      toast.success('Image deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery Upload</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upload and manage gallery images</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-2">Select images</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onPick(e.target.files)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-kaboss-50 file:text-kaboss-700 dark:file:bg-kaboss-500/10 dark:file:text-kaboss-300"
              />
              <button
                onClick={upload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600 transition-colors disabled:opacity-60"
                disabled={!files.length}
              >
                <Upload className="h-4 w-4" /> Upload
              </button>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Assign a category to each image:
                </p>
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <span className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate">
                      {file.name}
                    </span>
                    <select
                      value={categories[i] || 'others'}
                      onChange={(e) => setCategories((prev) => ({ ...prev, [i]: e.target.value }))}
                      className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-kaboss-500" />
            <h2 className="font-semibold">Current gallery images</h2>
          </div>
          <span className="text-sm text-gray-500">{images.length} total</span>
        </div>

        {images.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No gallery images uploaded.</div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((item) => (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
                >
                  <img
                    src={resolveImageUrl(item.url)}
                    alt="Gallery"
                    className="h-40 w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs capitalize">
                    {item.category}
                  </span>
                  <button
                    onClick={() => del(item.url)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

