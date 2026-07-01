import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

const types = ['daily', 'weekly', 'holiday', 'promotion', 'update', 'motivational', 'new-service'];

export function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'update' });

  useEffect(() => {
    apiRequest<any[]>('/admin/announcements').then(setItems).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', content: '', type: 'update' }); setShowModal(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({ title: a.title, content: a.content || '', type: a.type || 'update' }); setShowModal(true); };

  const save = async () => {
    if (editing) {
      const updated = await apiRequest<any>(`/admin/announcements/${editing._id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setItems((prev) => prev.map((a) => (a._id === editing._id ? updated : a)));
      toast.success('Announcement updated');
    } else {
      const created = await apiRequest<any>('/admin/announcements', { method: 'POST', body: JSON.stringify(form) });
      setItems((prev) => [created, ...prev]);
      toast.success('Announcement created');
    }
    setShowModal(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await apiRequest(`/admin/announcements/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((a) => a._id !== id));
    toast.success('Announcement deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{items.length} announcements</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Announcement
        </button>
      </div>

      <div className="space-y-3">
        {items.map((ann, i) => (
          <motion.div key={ann._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{ann.title}</h3>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-kaboss-100 text-kaboss-700 dark:bg-kaboss-900/30 dark:text-kaboss-400">
                    {ann.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{ann.content}</p>
              </div>
              <div className="flex gap-1 ml-4">
                <button onClick={() => openEdit(ann)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-kaboss-500">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => remove(ann._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-premium-dark rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Announcement' : 'New Announcement'}</h2>
            <div className="space-y-3">
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50">
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
