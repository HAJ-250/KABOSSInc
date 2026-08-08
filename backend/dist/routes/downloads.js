import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { verifyTokenMiddleware } from '../middleware/auth.js';
import BookingFile from '../models/BookingFile.js';
import Booking from '../models/Booking.js';
import { Op } from 'sequelize';
const router = Router();
router.use(verifyTokenMiddleware);
const BOOKING_FILES_ROOT = path.join(process.cwd(), 'uploads', 'booking-files');
function safeJoin(root, p) {
    const full = path.join(root, p);
    const rel = path.relative(root, full);
    if (rel.startsWith('..') || path.isAbsolute(rel))
        throw new Error('Invalid path');
    return full;
}
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const userBookingIds = await Booking.findAll({
            where: {
                userId: parseInt(userId),
                status: { [Op.in]: ['approved', 'in-progress', 'completed'] },
            },
            attributes: ['id'],
        });
        const bookingIds = userBookingIds.map((b) => b.id);
        if (bookingIds.length === 0)
            return res.json([]);
        const files = await BookingFile.findAll({
            where: { userId: parseInt(userId), bookingId: { [Op.in]: bookingIds } },
            order: [['createdAt', 'DESC']],
            limit: 200,
        });
        res.json(files);
    }
    catch (error) {
        console.error('Failed to fetch downloads:', error);
        res.status(500).json({ error: 'Failed to fetch downloads' });
    }
});
router.get('/:id/file', async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const file = await BookingFile.findByPk(req.params.id);
        if (!file)
            return res.status(404).json({ error: 'File not found' });
        if (String(file.userId) !== userId && req.userRole !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });
        const booking = await Booking.findByPk(file.bookingId);
        if (!booking)
            return res.status(404).json({ error: 'Booking not found' });
        // allow only eligible statuses
        if (String(booking.userId) !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (!['approved', 'in-progress', 'completed'].includes(booking.status))
            return res.status(403).json({ error: 'File not available yet' });
        // storagePath may be full or relative; we store relative file path.
        const storagePath = file.storagePath.startsWith('uploads')
            ? file.storagePath.replace(/^uploads[\\/]/, '')
            : file.storagePath;
        const absPath = safeJoin(BOOKING_FILES_ROOT, storagePath.replace(/^booking-files[\\/]/, ''));
        if (!fs.existsSync(absPath))
            return res.status(404).json({ error: 'File missing on server' });
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        const stream = fs.createReadStream(absPath);
        stream.pipe(res);
    }
    catch (error) {
        console.error('Failed to download file:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});
export default router;
//# sourceMappingURL=downloads.js.map