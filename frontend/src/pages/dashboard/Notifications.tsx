import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CalendarCheck, MessageSquare, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { connectSocket } from '@/services/socket';
import toast from 'react-hot-toast';

type Notif = {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'message' | 'booking_file' | 'status_update' | 'system';
  isRead: boolean;
  createdAt?: string;
};

function iconFor(type: Notif['type']) {
  switch (type) {
    case 'booking':
    case 'status_update':
      return CalendarCheck;
    case 'message':
      return MessageSquare;
    case 'booking_file':
      return Download;
    default:
      return Bell;
  }
}

async function downloadNotification(id: string) {
  try {
    const url = api.downloadNotification(id);
    window.open(url, '_blank');
  } catch (e: any) {
    toast.error(e.message || 'Download failed');
  }
}

export function DashboardNotifications() {
  const [notifications, setNotifications] = useState<Notif[]>([]);

  const load = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data as any);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load notifications');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update notification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">Stay updated with your activities</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const Icon = iconFor(notif.type);
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-premium-dark/80 border border-gray-100 dark:border-gray-800 card-hover"
              >
                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-kaboss-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    {!notif.isRead && <span className="text-xs text-kaboss-500 font-semibold">New</span>}
                  </div>
                  <p className="text-sm text-gray-500">{notif.body}</p>
                  {notif.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
<div className="flex flex-col items-end gap-2">
                  {notif.type === 'booking_file' && (
                    <Button size="sm" variant="outline" onClick={() => downloadNotification(notif.id)}>
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  )}
                  {!notif.isRead ? (
                    <Button size="sm" onClick={() => markRead(notif.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark read
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">Read</span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

