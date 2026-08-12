import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyTokenMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();
router.use(verifyTokenMiddleware);

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'profile');

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}
ensureDir(UPLOAD_ROOT);

function isAllowedImage(mimeType: string | undefined) {
  return (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/png' ||
    mimeType === 'image/webp' ||
    mimeType === 'image/gif'
  );
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      const safeExt = ext.toLowerCase();
      const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
      cb(null, filename);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!isAllowedImage(file.mimetype)) return cb(new Error('Invalid file type'));
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

/** Delete a previously uploaded profile file (best-effort). */
function deleteOldProfile(urlPath: string | undefined | null) {
  if (!urlPath) return;
  const prefix = '/uploads/profile/';
  if (!urlPath.startsWith(prefix)) return;
  const filename = urlPath.slice(prefix.length);
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) return;
  const filePath = path.join(UPLOAD_ROOT, filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Failed to delete old profile picture:', err);
  }
}

router.post('/', upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Image file is required' });

    const url = `/uploads/profile/${file.filename}`;

    const user = await User.findByPk(userId);
    if (!user) {
      // Roll back the just-uploaded file if the user no longer exists.
      const rollbackPath = path.join(UPLOAD_ROOT, file.filename);
      if (fs.existsSync(rollbackPath)) fs.unlinkSync(rollbackPath);
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the previous avatar from disk before replacing.
    deleteOldProfile((user as any).profilePictureUrl);

    (user as any).profilePictureUrl = url;
    await user.save();

    const updated = user.toJSON();
    delete (updated as any).password;
    res.json({ profilePictureUrl: url, user: updated });
  } catch (error: any) {
    console.error('Profile picture upload failed:', error);
    res.status(400).json({ error: 'Failed to upload profile picture' });
  }
});

export default router;
