import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Notification from '../models/Notification.js';
import BookingFile from '../models/BookingFile.js';
import { verifyTokenMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { getIO } from '../socket/index.js';

const BOOKING_FILES_ROOT = path.join(process.cwd(), 'uploads', 'booking-files');

function safeJoin(root: string, p: string) {
  const full = path.join(root, p);
  const rel = path.relative(root, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Invalid path');
  return full;
}

const router = Router();
router.use(verifyTokenMiddleware);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await Notification.findAll({
      where: { userId: parseInt(userId) },
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    res.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Helper to emit a notification to a user's socket room
export function emitNotificationToUser(userId: number, notification: any) {
  const io = getIO();
  if (!io) return;
  io.to(`user:${userId}`).emit('notification:new', notification);
}

// Download the file associated with a booking_file notification.
router.get('/:id/download', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    if (String(notif.userId) !== userId && req.userRole !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });

    if (notif.type !== 'booking_file') {
      return res.status(400).json({ error: 'This notification has no downloadable file' });
    }

    // Try to resolve a booking id embedded in the body ("booking #123")
    let bookingId: number | null = null;
    const match = notif.body.match(/booking\s*#?(\d+)/i) || notif.body.match(/#(\d+)/);
    if (match) bookingId = parseInt(match[1], 10);

    const where: any = { userId: parseInt(userId) };
    if (bookingId) where.bookingId = bookingId;

    const file = await BookingFile.findOne({
      where,
      order: [['createdAt', 'DESC']],
    });
    if (!file) return res.status(404).json({ error: 'No downloadable file found for this notification' });

    const storagePath = file.storagePath.startsWith('uploads')
      ? file.storagePath.replace(/^uploads[\\/]/, '')
      : file.storagePath;
    const absPath = safeJoin(BOOKING_FILES_ROOT, storagePath.replace(/^booking-files[\\/]/, ''));

    if (!fs.existsSync(absPath)) return res.status(404).json({ error: 'File missing on server' });

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    const stream = fs.createReadStream(absPath);
    stream.pipe(res);
  } catch (error) {
    console.error('Failed to download notification file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const readSchema = z.object({ isRead: z.boolean().default(true).optional() });
    const body = readSchema.safeParse(req.body);
    const isRead = body.success ? (body.data.isRead ?? true) : true;

    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    if (String(notif.userId) !== userId && req.userRole !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });

    notif.isRead = isRead;
    await notif.save();

    res.json({ message: 'Notification updated', notification: notif });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;

