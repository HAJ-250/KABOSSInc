import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Settings from '../models/Settings.js';
import { verifyTokenMiddleware, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.use(verifyTokenMiddleware, requireAdmin);
const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
function isAllowedImage(mimeType) {
    return (mimeType === 'image/jpeg' ||
        mimeType === 'image/png' ||
        mimeType === 'image/webp' ||
        mimeType === 'image/gif');
}
const imageFilter = (_req, file, cb) => {
    if (!isAllowedImage(file.mimetype)) {
        return cb(new Error('Invalid file type. Only images are allowed.'));
    }
    cb(null, true);
};
const mkStorage = (subDir) => {
    const dir = path.join(UPLOAD_ROOT, subDir);
    ensureDir(dir);
    return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, dir),
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname) || '';
            const safeExt = ext.toLowerCase();
            const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
            cb(null, filename);
        },
    });
};
const galleryUpload = multer({
    storage: mkStorage('gallery'),
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});
const profileUpload = multer({
    storage: mkStorage('profile'),
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});
const VALID_CATEGORIES = ['printing', 'design', 'photography', 'events', 'studio', 'others'];
function normalizeCategory(cat) {
    const c = (cat || 'others').toLowerCase().trim();
    return VALID_CATEGORIES.includes(c) ? c : 'others';
}
/**
 * Normalize stored galleryImages (which may be legacy plain strings or objects
 * with url+category) into a canonical array of { url, category } objects.
 */
function normalizeGalleryItems(raw) {
    if (!Array.isArray(raw))
        return [];
    return raw
        .map((item) => {
        if (typeof item === 'string') {
            return { url: item, category: 'others' };
        }
        if (item && typeof item === 'object' && typeof item.url === 'string') {
            return { url: item.url, category: normalizeCategory(item.category) };
        }
        return null;
    })
        .filter((i) => i !== null);
}
async function getSettingsValue(key) {
    const existing = await Settings.findOne({ where: { key: 'general' } });
    if (!existing?.value)
        return {};
    try {
        return JSON.parse(existing.value);
    }
    catch {
        return {};
    }
}
async function setSettingsValue(next) {
    const existing = await Settings.findOne({ where: { key: 'general' } });
    if (existing) {
        await Settings.update({ value: JSON.stringify(next) }, { where: { key: 'general' } });
    }
    else {
        await Settings.create({ key: 'general', value: JSON.stringify(next) });
    }
}
function publicUrlFor(subDir, filename) {
    return `/uploads/${subDir}/${filename}`;
}
router.get('/images', async (_req, res) => {
    try {
        const settings = await getSettingsValue('general');
        const raw = Array.isArray(settings.galleryImages) ? settings.galleryImages : [];
        const normalized = normalizeGalleryItems(raw);
        const profilePictures = Array.isArray(settings.profilePictures)
            ? settings.profilePictures
            : [];
        res.json({
            galleryImages: normalized,
            profilePictures,
        });
    }
    catch (error) {
        console.error('Failed to fetch image settings:', error);
        res.status(500).json({ error: 'Failed to fetch image settings' });
    }
});
router.post('/upload/gallery', galleryUpload.array('images', 50), async (req, res) => {
    try {
        const files = (req.files || []);
        // The admin UI sends a per-file category map like { "__0": "printing", ... }
        // or a single "category" field. Fall back to "others" when unspecified.
        const catMap = {};
        // The categories field is sent as a JSON string via FormData.
        let categories = req.body?.categories;
        if (typeof categories === 'string') {
            try {
                categories = JSON.parse(categories);
            }
            catch {
                categories = null;
            }
        }
        if (categories && typeof categories === 'object') {
            for (const [k, v] of Object.entries(categories)) {
                catMap[k] = normalizeCategory(String(v));
            }
        }
        const singleCategory = normalizeCategory(req.body?.category);
        const newItems = files.map((f, i) => {
            const url = publicUrlFor('gallery', f.filename);
            const category = catMap[`__${i}`] || catMap[String(i)] || singleCategory;
            return { url, category };
        });
        const settings = await getSettingsValue('general');
        const current = normalizeGalleryItems(settings.galleryImages);
        const next = {
            ...settings,
            galleryImages: [...current, ...newItems],
        };
        await setSettingsValue(next);
        res.status(201).json({ galleryImages: next.galleryImages });
    }
    catch (error) {
        console.error('Failed to upload gallery:', error);
        res.status(400).json({ error: error?.message || 'Failed to upload gallery' });
    }
});
router.post('/upload/profile', profileUpload.array('images', 10), async (req, res) => {
    try {
        const files = (req.files || []);
        const urls = files.map((f) => publicUrlFor('profile', f.filename));
        const settings = await getSettingsValue('general');
        const current = Array.isArray(settings.profilePictures) ? settings.profilePictures : [];
        const next = {
            ...settings,
            profilePictures: [...current, ...urls],
        };
        await setSettingsValue(next);
        res.status(201).json({ profilePictures: next.profilePictures });
    }
    catch (error) {
        console.error('Failed to upload profile:', error);
        res.status(400).json({ error: error?.message || 'Failed to upload profile images' });
    }
});
function fileNameFromPublicUrl(url, expectedSubDir) {
    // expects /uploads/{subDir}/{filename}
    const prefix = `/uploads/${expectedSubDir}/`;
    if (!url.startsWith(prefix))
        return null;
    return url.slice(prefix.length);
}
router.delete('/gallery/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(UPLOAD_ROOT, 'gallery', filename);
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
        const settings = await getSettingsValue('general');
        const current = normalizeGalleryItems(settings.galleryImages);
        const removeUrl = publicUrlFor('gallery', filename);
        const next = {
            ...settings,
            galleryImages: current.filter((item) => item.url !== removeUrl),
        };
        await setSettingsValue(next);
        res.json({ galleryImages: next.galleryImages });
    }
    catch (error) {
        console.error('Failed to delete gallery image:', error);
        res.status(500).json({ error: 'Failed to delete gallery image' });
    }
});
router.delete('/profile/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(UPLOAD_ROOT, 'profile', filename);
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
        const settings = await getSettingsValue('general');
        const current = Array.isArray(settings.profilePictures) ? settings.profilePictures : [];
        const removeUrl = publicUrlFor('profile', filename);
        const next = {
            ...settings,
            profilePictures: current.filter((u) => u !== removeUrl),
        };
        await setSettingsValue(next);
        res.json({ profilePictures: next.profilePictures });
    }
    catch (error) {
        console.error('Failed to delete profile image:', error);
        res.status(500).json({ error: 'Failed to delete profile image' });
    }
});
export default router;
//# sourceMappingURL=admin-upload.js.map