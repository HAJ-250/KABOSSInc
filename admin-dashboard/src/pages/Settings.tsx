import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const [form, setForm] = useState<any>({
    heroTitle: '', heroSubtitle: '', mission: '', vision: '',
    coreValues: [] as string[],
    businessHours: {} as Record<string, string>,
    contact: { phone: '', email: '', whatsapp: '', address: '' },
    socialMedia: { facebook: '', instagram: '', whatsapp: '' },
    seo: { title: '', description: '', keywords: '' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any>('/admin/settings')
      .then((data) => { if (Object.keys(data).length) setForm(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    await apiRequest('/admin/settings', { method: 'PATCH', body: JSON.stringify(form) });
    toast.success('Settings saved');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-4 border-kaboss-500 border-t-transparent animate-spin" /></div>;

  const update = (path: string, value: any) => {
    setForm((prev: any) => {
      const copy = { ...prev };
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] = { ...obj[keys[i]] };
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your website content globally</p>
        </div>
        <button onClick={save}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaboss-500 text-white font-medium hover:bg-kaboss-600 transition-colors">
          <Save className="h-4 w-4" /> Save All
        </button>
      </div>

      <div className="space-y-4">
        <Section title="Hero Section">
          <Field label="Hero Title" value={form.heroTitle} onChange={(v: string) => update('heroTitle', v)} />
          <Field label="Hero Subtitle" value={form.heroSubtitle} onChange={(v: string) => update('heroSubtitle', v)} />
        </Section>

        <Section title="About">
          <Field label="Mission" value={form.mission} onChange={(v: string) => update('mission', v)} textarea />
          <Field label="Vision" value={form.vision} onChange={(v: string) => update('vision', v)} textarea />
          <Field label="Core Values (comma separated)" value={form.coreValues?.join(', ') || ''}
            onChange={(v: string) => update('coreValues', v.split(',').map((s: string) => s.trim()))} />
        </Section>

        <Section title="Contact Information">
          <Field label="Phone" value={form.contact?.phone || ''} onChange={(v: string) => update('contact.phone', v)} />
          <Field label="Email" value={form.contact?.email || ''} onChange={(v: string) => update('contact.email', v)} />
          <Field label="WhatsApp" value={form.contact?.whatsapp || ''} onChange={(v: string) => update('contact.whatsapp', v)} />
          <Field label="Address" value={form.contact?.address || ''} onChange={(v: string) => update('contact.address', v)} textarea />
        </Section>

        <Section title="Social Media">
          <Field label="Facebook URL" value={form.socialMedia?.facebook || ''} onChange={(v: string) => update('socialMedia.facebook', v)} />
          <Field label="Instagram URL" value={form.socialMedia?.instagram || ''} onChange={(v: string) => update('socialMedia.instagram', v)} />
          <Field label="WhatsApp URL" value={form.socialMedia?.whatsapp || ''} onChange={(v: string) => update('socialMedia.whatsapp', v)} />
        </Section>

        <Section title="SEO">
          <Field label="Meta Title" value={form.seo?.title || ''} onChange={(v: string) => update('seo.title', v)} />
          <Field label="Meta Description" value={form.seo?.description || ''} onChange={(v: string) => update('seo.description', v)} textarea />
          <Field label="Meta Keywords" value={form.seo?.keywords || ''} onChange={(v: string) => update('seo.keywords', v)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
      <h2 className="font-semibold mb-4 text-lg">{title}</h2>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-premium-dark/80 focus:outline-none focus:ring-2 focus:ring-kaboss-500/50" />
      )}
    </div>
  );
}
