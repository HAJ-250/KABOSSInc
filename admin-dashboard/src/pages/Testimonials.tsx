import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

export function TestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5 });

  useEffect(() => {
    apiRequest<any[]>('/admin/testimonials').then(setItems).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', role: '', content: '', rating: 5 }); setShowModal(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name, role: t.role || '', content: t.content || '', rating: t.rating || 5 }); setShowModal(true); };

  const save = async () => {
    if (editing) {
      const updated = await apiRequest<any>(`/admin/testimonials/${editing._id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setItems((prev) => prev.map((t) => (t._id === editing._id ? updated : t)));
      toast.success('Testimonial updated');
    } else {
      const created = await apiRequest<any>('/admin/testimonials', { method: 'POST', body: JSON.stringify(form) });
      setItems((prev) => [created, ...prev]);
      toast.success('Testimonial created');
    }
    setShowModal(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await apiRequest(`/admin/testimonials/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((t) => t._id !== id));
    toast.success('Testimonial deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{items.length} testimonials</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kaboss-500/20 to-kaboss-700/20 flex items-center justify-center text-kaboss-600 font-bold">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.role || 'Client'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-kaboss-500">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => remove(item._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic">"{item.content}"</p>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <span key={j} className={`text-sm ${j < (item.rating || 5) ? 'text-amber-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-premium-dark rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2>
            <div className="space-y-3">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <input placeholder="Role (optional)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Rating (1-5)</label>
                <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              </div>
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
