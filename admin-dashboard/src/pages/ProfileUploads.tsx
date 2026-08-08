import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, UserCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getToken } from '../lib/api';

type ImgList = { profilePictures: string[] };

export function ProfileUploadsPage() {

  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  const token = getToken();

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/images', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data: any) => {
        if (!mounted) return;
        setImages(Array.isArray(data?.profilePictures) ? data.profilePictures : []);
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
  };

  const upload = async () => {
    if (!files.length) return toast.error('Pick images first');
    try {
      const form = new FormData();
      files.forEach((f) => form.append('images', f));

      const res = await fetch('/api/admin/upload/profile', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      const data: ImgList = await res.json();
      if (!res.ok) throw new Error((data as any)?.error || 'Upload failed');

      setImages(data.profilePictures || []);
      setFiles([]);
      toast.success('Profile images updated');
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    }
  };

  const del = async (url: string) => {
    try {
      const filename = url.split('/').pop();
      if (!filename) return;

      const res = await fetch(`/api/admin/profile/${filename}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');

      setImages(data.profilePictures || []);
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
          <h1 className="text-3xl font-bold">Profile Uploads</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upload and manage profile images</p>
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
            {files.length > 0 && <p className="mt-3 text-sm text-gray-500">{files.length} file(s) selected</p>}
          </div>
        </div>
      </motion.div>

      <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-kaboss-500" />
            <h2 className="font-semibold">Current profile images</h2>
          </div>
          <span className="text-sm text-gray-500">{images.length} total</span>
        </div>

        {images.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No profile images uploaded.</div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
                >
                  <img src={url} alt="Profile" className="h-40 w-full object-cover" />
                  <button
                    onClick={() => del(url)}
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

