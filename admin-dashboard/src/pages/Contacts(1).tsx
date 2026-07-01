import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

export function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    apiRequest<any[]>('/admin/contacts').then(setContacts).catch(() => {});
  }, []);

  const markRead = async (id: string) => {
    await apiRequest(`/admin/contacts/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead: true }) });
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isRead: true } : c)));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this contact message?')) return;
    await apiRequest(`/admin/contacts/${id}`, { method: 'DELETE' });
    setContacts((prev) => prev.filter((c) => c._id !== id));
    if (selected?._id === id) setSelected(null);
    toast.success('Contact deleted');
  };

  const filtered = contacts.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{contacts.length} messages</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((contact, i) => (
              <motion.div key={contact._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                onClick={() => { setSelected(contact); markRead(contact._id); }}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${selected?._id === contact._id ? 'bg-kaboss-50 dark:bg-kaboss-950/30' : ''} ${!contact.isRead ? 'border-l-2 border-l-kaboss-500' : ''}`}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="font-medium text-sm">{contact.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{contact.email}</span>
                  </div>
                  <span className="text-xs text-gray-400">{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <p className="text-sm font-medium text-kaboss-500 mb-1">{contact.subject}</p>
                <p className="text-sm text-gray-500 truncate">{contact.message}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selected.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${selected.email}`} className="hover:text-kaboss-500">{selected.email}</a>
                  </div>
                  {selected.phone && <p className="text-sm text-gray-500 mt-1">📞 {selected.phone}</p>}
                </div>
                <button onClick={() => remove(selected._id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-kaboss-100 text-kaboss-700 dark:bg-kaboss-900/30 dark:text-kaboss-400">
                  {selected.subject}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.message}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Mail className="h-12 w-12 mb-3" />
              <p>Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
