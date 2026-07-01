import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function DashboardSettings() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { deleteAccount } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-gray-500 dark:text-gray-400">Customize your experience</p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {isDarkMode ? <Moon className="h-5 w-5 text-kaboss-500" /> : <Sun className="h-5 w-5 text-kaboss-500" />}
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle dark/light theme</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative h-7 w-12 rounded-full transition-colors ${isDarkMode ? 'bg-kaboss-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${isDarkMode ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Bell className="h-5 w-5 text-kaboss-500" />
            </div>
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
          </div>
          <div className="space-y-3 ml-13">
            {['Booking updates', 'New messages', 'Promotions'].map((item) => (
              <label key={item} className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-kaboss-500 focus:ring-kaboss-500" />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-red-500">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently delete your account and data</p>
            </div>
          </div>
          {!confirmDelete ? (
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-500">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={handleDelete}>Yes, Delete</Button>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
