import { Router } from 'express';
import Notification from '../models/Notification.js';
import { verifyTokenMiddleware } from '../middleware/auth.js';
import { z } from 'zod';
import { getIO } from '../socket/index.js';
const router = Router();
router.use(verifyTokenMiddleware);
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const notifications = await Notification.findAll({
            where: { userId: parseInt(userId) },
            order: [['createdAt', 'DESC']],
            limit: 200,
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Failed to fetch notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// Helper to emit a notification to a user's socket room
export function emitNotificationToUser(userId, notification) {
    const io = getIO();
    if (!io)
        return;
    io.to(`user:${userId}`).emit('notification:new', notification);
}
router.patch('/:id/read', async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const readSchema = z.object({ isRead: z.boolean().default(true).optional() });
        const body = readSchema.safeParse(req.body);
        const isRead = body.success ? (body.data.isRead ?? true) : true;
        const notif = await Notification.findByPk(req.params.id);
        if (!notif)
            return res.status(404).json({ error: 'Notification not found' });
        if (String(notif.userId) !== userId && req.userRole !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });
        notif.isRead = isRead;
        await notif.save();
        res.json({ message: 'Notification updated', notification: notif });
    }
    catch (error) {
        console.error('Failed to mark notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});
export default router;
//# sourceMappingURL=notifications.js.map