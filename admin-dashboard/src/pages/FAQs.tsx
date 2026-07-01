import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

export function FAQsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', sortOrder: 0 });

  useEffect(() => {
    apiRequest<any[]>('/admin/faqs').then(setItems).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm({ question: '', answer: '', category: 'general', sortOrder: 0 }); setShowModal(true); };
  const openEdit = (f: any) => { setEditing(f); setForm({ question: f.question, answer: f.answer || '', category: f.category || 'general', sortOrder: f.sortOrder || 0 }); setShowModal(true); };

  const save = async () => {
    if (editing) {
      const updated = await apiRequest<any>(`/admin/faqs/${editing._id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setItems((prev) => prev.map((f) => (f._id === editing._id ? updated : f)));
      toast.success('FAQ updated');
    } else {
      const created = await apiRequest<any>('/admin/faqs', { method: 'POST', body: JSON.stringify(form) });
      setItems((prev) => [created, ...prev]);
      toast.success('FAQ created');
    }
    setShowModal(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await apiRequest(`/admin/faqs/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((f) => f._id !== id));
    toast.success('FAQ deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{items.length} FAQs</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600 transition-colors">
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {items.map((faq, i) => (
          <motion.div key={faq._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {faq.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{faq.answer}</p>
              </div>
              <div className="flex gap-1 ml-4">
                <button onClick={() => openEdit(faq)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-kaboss-500">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => remove(faq._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
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
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit FAQ' : 'New FAQ'}</h2>
            <div className="space-y-3">
              <input placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <textarea placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <input type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
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
