import { motion } from 'framer-motion';
import { Download, FileText, Image, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const files = [
  { name: 'Wedding_Invitation_Design.pdf', type: 'PDF', size: '2.4 MB', date: 'Dec 15, 2024' },
  { name: 'Graduation_Photos.zip', type: 'Images', size: '15 MB', date: 'Jan 10, 2025' },
  { name: 'Business_Cards_Print.pdf', type: 'PDF', size: '1.1 MB', date: 'Jan 20, 2025' },
  { name: 'Event_Receipt.pdf', type: 'PDF', size: '0.5 MB', date: 'Feb 1, 2025' },
];

export function DashboardDownloads() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Downloads</h1>
      <p className="text-gray-500 dark:text-gray-400">Access your completed files and documents</p>

      <div className="space-y-3">
        {files.map((file, i) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kaboss-500/10 to-kaboss-700/10 flex items-center justify-center">
                {file.type === 'PDF' ? <FileText className="h-6 w-6 text-kaboss-500" /> :
                 file.type === 'Images' ? <Image className="h-6 w-6 text-kaboss-500" /> :
                 <FileIcon className="h-6 w-6 text-kaboss-500" />}
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Badge variant="secondary">{file.type}</Badge>
                  <span>{file.size}</span>
                  <span>{file.date}</span>
                </div>
              </div>
            </div>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
