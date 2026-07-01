import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export function DashboardProfile() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

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
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-kaboss-500 to-kaboss-700 flex items-center justify-center text-white text-3xl font-bold">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Camera className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <div>
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
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 78X XXX XXX" />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
