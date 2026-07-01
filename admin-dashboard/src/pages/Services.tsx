import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

export function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', category: '', description: '' });

  useEffect(() => {
    apiRequest<any[]>('/admin/services').then(setServices).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', category: '', description: '' }); setShowModal(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ title: s.title, category: s.category || '', description: s.description || '' }); setShowModal(true); };

  const save = async () => {
    if (editing) {
      const updated = await apiRequest<any>(`/admin/services/${editing._id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setServices((prev) => prev.map((s) => (s._id === editing._id ? updated : s)));
      toast.success('Service updated');
    } else {
      const created = await apiRequest<any>('/admin/services', { method: 'POST', body: JSON.stringify(form) });
      setServices((prev) => [created, ...prev]);
      toast.success('Service created');
    }
    setShowModal(false);
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await apiRequest(`/admin/services/${id}`, { method: 'DELETE' });
    setServices((prev) => prev.filter((s) => s._id !== id));
    toast.success('Service deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{services.length} services</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, i) => (
          <motion.div key={service._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">{service.title}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(service)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-kaboss-500">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => deleteService(service._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{service.description}</p>
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {service.category || 'general'}
            </span>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-premium-dark rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Service' : 'New Service'}</h2>
            <div className="space-y-3">
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
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
