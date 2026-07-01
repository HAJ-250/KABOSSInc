import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Shield, UserCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiRequest<any[]>('/admin/users').then(setUsers).catch(() => {});
  }, []);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    await apiRequest(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    toast.success(`User role changed to ${newRole}`);
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter((u) => u._id !== id));
    toast.success('User deleted');
  };

  const filtered = users.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50"
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-kaboss-500/20 to-kaboss-700/20 flex items-center justify-center text-sm font-medium text-kaboss-600">
                        {user.displayName?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{user.email || '—'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-kaboss-100 text-kaboss-700 dark:bg-kaboss-900/30 dark:text-kaboss-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive !== false
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleRole(user._id, user.role)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-kaboss-500"
                        title="Toggle admin role">
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteUser(user._id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500"
                        title="Delete user">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
