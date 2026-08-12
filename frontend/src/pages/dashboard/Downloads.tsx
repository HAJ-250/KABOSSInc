import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { getApiUrl, getAuthToken } from '@/lib/firebase';

type DownloadRec = {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'zip' | 'other';
  mimeType: string;
  storagePath: string;
  createdAt?: string;
};

function typeLabel(t: DownloadRec['fileType']) {
  if (t === 'pdf') return 'PDF';
  if (t === 'zip') return 'ZIP';
  if (t === 'image') return 'Image';
  return 'File';
}

function iconFor(t: DownloadRec['fileType']) {
  if (t === 'pdf') return FileText;
  if (t === 'image') return Image;
  return FileIcon;
}

export function DashboardDownloads() {
  const [files, setFiles] = useState<DownloadRec[]>([]);

  const load = async () => {
    try {
      const data = await api.getDownloads();
      setFiles(data as any);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load downloads');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const download = (id: string) => {
    const token = getAuthToken();
    const url = `${getApiUrl()}/downloads/${id}/file${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  const title = useMemo(() => 'Downloads', []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400">Access your completed files and documents</p>

      <div className="space-y-3">
        {files.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">No files available for download yet.</p>
          </div>
        ) : (
          files.map((file, i) => {
            const Icon = iconFor(file.fileType);
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-kaboss-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Badge variant="secondary">{typeLabel(file.fileType)}</Badge>
                      {file.createdAt && <span>{new Date(file.createdAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => download(file.id)}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

