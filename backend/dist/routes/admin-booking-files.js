import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { verifyTokenMiddleware, requireAdmin } from '../middleware/auth.js';
import { z } from 'zod';
import Booking from '../models/Booking.js';
import BookingFile from '../models/BookingFile.js';
import Notification from '../models/Notification.js';
const router = Router();
router.use(verifyTokenMiddleware, requireAdmin);
const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'booking-files');
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
ensureDir(UPLOAD_ROOT);
const allowed = new Set([
    'application/pdf',
    'application/zip',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);
function fileFilter(_req, file, cb) {
    if (!allowed.has(file.mimetype))
        return cb(new Error('Invalid file type'));
    cb(null, true);
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`.replace(/\s+/g, '_');
        cb(null, filename);
    },
});
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 30 * 1024 * 1024 },
});
const schema = z.object({ bookingId: z.string().min(1) });
function fileTypeFromMime(mime) {
    if (mime === 'application/pdf')
        return 'pdf';
    if (mime === 'application/zip')
        return 'zip';
    if (mime.startsWith('image/'))
        return 'image';
    return 'other';
}
router.post('/:bookingId/files', upload.single('file'), async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findByPk(bookingId);
        if (!booking)
            return res.status(404).json({ error: 'Booking not found' });
        const bId = parseInt(bookingId);
        const userId = booking.userId;
        const f = req.file;
        if (!f)
            return res.status(400).json({ error: 'File is required' });
        const storagePath = f.filename; // relative filename inside booking-files root
        const rec = await BookingFile.create({
            bookingId: bId,
            userId,
            fileType: fileTypeFromMime(f.mimetype),
            fileName: f.originalname,
            mimeType: f.mimetype,
            storagePath,
        });
        // notify user
        await Notification.create({
            userId,
            type: 'booking_file',
            title: 'Files ready for download',
            body: `Your files for booking #${bookingId} are ready.`,
            isRead: false,
        });
        res.status(201).json(rec);
    }
    catch (error) {
        console.error('Failed to upload booking file:', error);
        res.status(400).json({ error: error?.message || 'Failed to upload file' });
    }
});
export default router;
//# sourceMappingURL=admin-booking-files.js.map