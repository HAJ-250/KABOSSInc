import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, UploadCloud, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { apiRequest } from '@/lib/firebase';
import { resolveImageUrl } from '@/lib/utils';

export function DashboardProfile() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const profilePictureUrl = (user as any)?.profilePictureUrl as string | undefined;
  const avatarSrc = profilePictureUrl ? resolveImageUrl(profilePictureUrl) : undefined;

  const handlePick = () => {
    fileRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await apiRequest<{ user: any }>('/profile-picture', { method: 'POST', body: form });
      toast.success('Profile picture updated');
      // Refresh the AuthContext user with the new profile picture URL.
      if (res?.user) {
        await updateUserProfile({
          displayName: res.user.displayName ?? name,
          phone: res.user.phone ?? phone,
          profilePictureUrl: res.user.profilePictureUrl,
        });
      } else {
        const updated = await apiRequest<any>('/auth/me');
        await updateUserProfile({
          displayName: updated.displayName ?? name,
          phone: updated.phone ?? phone,
          profilePictureUrl: updated.profilePictureUrl,
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile({ displayName: name, phone });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-gray-500 dark:text-gray-400">Manage your account information</p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800"
>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-4xl font-bold overflow-hidden ring-4 ring-kaboss-500/15">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0) || 'U'
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
              <button
                type="button"
                onClick={handlePick}
                disabled={uploading}
                aria-label="Change profile picture"
                className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
              >
                <Camera className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePick}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <p className="text-xs text-gray-400 -mt-1">JPG, PNG, WEBP or GIF. Max 10MB.</p>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">{user?.displayName}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block px-3 py-1 rounded-full bg-kaboss-100 dark:bg-kaboss-900/50 text-kaboss-600 dark:text-kaboss-400 text-xs font-medium mt-1 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-800/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 788 882 296" />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
