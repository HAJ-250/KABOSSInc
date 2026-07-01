import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

export function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', logo: '', sortOrder: 0 });

  useEffect(() => {
    apiRequest<any[]>('/admin/partners').then(setPartners).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', logo: '', sortOrder: 0 }); setShowModal(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name, description: p.description || '', logo: p.logo || '', sortOrder: p.sortOrder || 0 }); setShowModal(true); };

  const save = async () => {
    if (editing) {
      const updated = await apiRequest<any>(`/admin/partners/${editing._id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setPartners((prev) => prev.map((p) => (p._id === editing._id ? updated : p)));
      toast.success('Partner updated');
    } else {
      const created = await apiRequest<any>('/admin/partners', { method: 'POST', body: JSON.stringify(form) });
      setPartners((prev) => [created, ...prev]);
      toast.success('Partner created');
    }
    setShowModal(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this partner?')) return;
    await apiRequest(`/admin/partners/${id}`, { method: 'DELETE' });
    setPartners((prev) => prev.filter((p) => p._id !== id));
    toast.success('Partner deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partners</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{partners.length} partners</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Partner
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((partner, i) => (
          <motion.div key={partner._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-kaboss-500/20 to-kaboss-700/20 flex items-center justify-center text-kaboss-600 font-bold">
                  {partner.logo || partner.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{partner.name}</h3>
                  <p className="text-xs text-gray-500">Order: {partner.sortOrder || 0}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(partner)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-kaboss-500">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => remove(partner._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">{partner.description}</p>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-premium-dark rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Partner' : 'New Partner'}</h2>
            <div className="space-y-3">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <input placeholder="Logo (short text)" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
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
